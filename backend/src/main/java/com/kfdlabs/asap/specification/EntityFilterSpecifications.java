package com.kfdlabs.asap.specification;

import com.kfdlabs.asap.entity.CustomFieldValue;
import com.kfdlabs.asap.entity.EntityTag;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Reusable JPA Specification builders for filtering entities.
 * Custom field filters use native SQL functions to handle PostgreSQL JSONB values.
 */
public final class EntityFilterSpecifications {

    private EntityFilterSpecifications() {}

    // ---- Generic filters ----

    public static <T> Specification<T> hasOrganization(UUID orgId) {
        return (root, cq, cb) -> cb.equal(root.get("organizationId"), orgId);
    }

    public static <T> Specification<T> textSearch(String query, String... fields) {
        return (root, cq, cb) -> {
            if (query == null || query.isBlank()) return cb.conjunction();
            String pattern = "%" + query.toLowerCase() + "%";
            Predicate[] predicates = Arrays.stream(fields)
                    .map(f -> cb.like(cb.lower(root.get(f)), pattern))
                    .toArray(Predicate[]::new);
            return cb.or(predicates);
        };
    }

    public static <T> Specification<T> hasAnyTag(List<UUID> tagIds, String entityType) {
        return (root, cq, cb) -> {
            if (tagIds == null || tagIds.isEmpty()) return cb.conjunction();
            Subquery<UUID> sub = cq.subquery(UUID.class);
            Root<EntityTag> etRoot = sub.from(EntityTag.class);
            sub.select(etRoot.get("entityId"));
            sub.where(
                    cb.equal(etRoot.get("entityType"), entityType),
                    etRoot.get("tag").get("id").in(tagIds),
                    cb.equal(etRoot.get("entityId"), root.get("id"))
            );
            return cb.exists(sub);
        };
    }

    // ---- Custom field filters (per data type) ----

    /**
     * Build a custom field filter specification based on field type.
     * Dispatches to the right handler for each JSONB value shape.
     */
    public static <T> Specification<T> customFieldFilter(
            UUID fieldId, String fieldType, String op, Object value) {
        return switch (fieldType) {
            case "NUMBER" -> customFieldNumber(fieldId, op, value);
            case "BOOLEAN" -> customFieldBoolean(fieldId, value);
            case "SELECT" -> customFieldSelect(fieldId, value);
            case "MULTI_SELECT" -> customFieldMultiSelect(fieldId, String.valueOf(value));
            case "DATE" -> customFieldDate(fieldId, op, String.valueOf(value));
            // TEXT, URL, EMAIL, PHONE, FILE — all string types use contains
            default -> customFieldStringContains(fieldId, String.valueOf(value));
        };
    }

    /**
     * String contains (case-insensitive): lower(jsonb_to_text(value)) LIKE '%input%'
     */
    private static <T> Specification<T> customFieldStringContains(UUID fieldId, String value) {
        return cfvExists(fieldId, (cfvRoot, cb) -> {
            Expression<String> asText = jsonbToText(cfvRoot, cb);
            return cb.like(cb.lower(asText), "%" + value.toLowerCase() + "%");
        });
    }

    /**
     * Number comparison: (value #>> '{}')::numeric op ?
     * Since we can't easily do #>> in JPA, we compare JSONB directly:
     * - eq: value = to_jsonb(123::numeric)
     * - gt/gte/lt/lte: use function-based numeric extraction
     */
    private static <T> Specification<T> customFieldNumber(UUID fieldId, String op, Object value) {
        double numValue;
        if (value instanceof Number n) {
            numValue = n.doubleValue();
        } else {
            try {
                numValue = Double.parseDouble(String.valueOf(value));
            } catch (NumberFormatException e) {
                numValue = 0;
            }
        }

        if ("eq".equals(op)) {
            double finalNum = numValue;
            return cfvExists(fieldId, (cfvRoot, cb) -> {
                Expression<String> asText = jsonbToText(cfvRoot, cb);
                return cb.equal(asText, String.valueOf(finalNum));
            });
        }

        double finalNumValue = numValue;
        return cfvExists(fieldId, (cfvRoot, cb) -> {
            Expression<String> asText = jsonbToText(cfvRoot, cb);
            Expression<Double> asDouble = asText.as(Double.class);
            return switch (op) {
                case "gt" -> cb.gt(asDouble, finalNumValue);
                case "gte" -> cb.ge(asDouble, finalNumValue);
                case "lt" -> cb.lt(asDouble, finalNumValue);
                case "lte" -> cb.le(asDouble, finalNumValue);
                default -> cb.equal(asDouble, finalNumValue);
            };
        });
    }

    /**
     * Boolean: concat('', value) = 'true' or 'false'
     * JSON booleans are bare words, so text extraction gives "true"/"false" directly.
     */
    private static <T> Specification<T> customFieldBoolean(UUID fieldId, Object value) {
        boolean boolValue = value instanceof Boolean b ? b : Boolean.parseBoolean(String.valueOf(value));
        return cfvExists(fieldId, (cfvRoot, cb) -> {
            Expression<String> asText = jsonbToText(cfvRoot, cb);
            return cb.equal(asText, String.valueOf(boolValue));
        });
    }

    /**
     * Select (single value, case-insensitive exact match)
     */
    private static <T> Specification<T> customFieldSelect(UUID fieldId, Object value) {
        String val = String.valueOf(value).toLowerCase();
        return cfvExists(fieldId, (cfvRoot, cb) -> {
            Expression<String> asText = jsonbToText(cfvRoot, cb);
            return cb.equal(cb.lower(asText), "\"" + val + "\"");
        });
    }

    /**
     * Multi-select (JSONB array contains): value::text LIKE '%"option"%'
     */
    private static <T> Specification<T> customFieldMultiSelect(UUID fieldId, String value) {
        return cfvExists(fieldId, (cfvRoot, cb) -> {
            Expression<String> asText = jsonbToText(cfvRoot, cb);
            String escaped = value.replace("\"", "\\\"");
            return cb.like(asText, "%\"" + escaped + "\"%");
        });
    }

    /**
     * Date comparison: value = to_jsonb('2024-01-15'::text) for eq,
     * or string comparison for gt/lt (ISO dates sort lexicographically).
     */
    private static <T> Specification<T> customFieldDate(UUID fieldId, String op, String value) {
        if ("eq".equals(op)) {
            String val = value.toLowerCase();
            return cfvExists(fieldId, (cfvRoot, cb) -> {
                Expression<String> asText = jsonbToText(cfvRoot, cb);
                return cb.equal(cb.lower(asText), "\"" + val + "\"");
            });
        }

        return cfvExists(fieldId, (cfvRoot, cb) -> {
            Expression<String> asText = jsonbToText(cfvRoot, cb);
            String jsonDate = "\"" + value + "\""; // compare against the JSON-encoded form
            return switch (op) {
                case "gt" -> cb.greaterThan(asText, jsonDate);
                case "gte" -> cb.greaterThanOrEqualTo(asText, jsonDate);
                case "lt" -> cb.lessThan(asText, jsonDate);
                case "lte" -> cb.lessThanOrEqualTo(asText, jsonDate);
                default -> cb.equal(asText, jsonDate);
            };
        });
    }

    // ---- Helpers ----

    /**
     * Casts JSONB value to text using a custom PostgreSQL function (see 002-jsonb-to-text.sql).
     * Hibernate won't intercept this because it's not in its built-in function registry.
     * Result: strings → "hello" (with JSON quotes), numbers → 123, booleans → true/false.
     */
    private static Expression<String> jsonbToText(Root<CustomFieldValue> cfvRoot, CriteriaBuilder cb) {
        return cb.function("jsonb_to_text", String.class, cfvRoot.get("value"));
    }

    /**
     * Builds an EXISTS subquery on custom_field_values with a custom predicate on the value.
     */
    private static <T> Specification<T> cfvExists(
            UUID fieldId, java.util.function.BiFunction<Root<CustomFieldValue>, CriteriaBuilder, Predicate> valuePredicate) {
        return (root, cq, cb) -> {
            Subquery<UUID> sub = cq.subquery(UUID.class);
            Root<CustomFieldValue> cfvRoot = sub.from(CustomFieldValue.class);
            sub.select(cfvRoot.get("entityId"));
            sub.where(
                    cb.equal(cfvRoot.get("customFieldDefinition").get("id"), fieldId),
                    cb.equal(cfvRoot.get("entityId"), root.get("id")),
                    valuePredicate.apply(cfvRoot, cb)
            );
            return cb.exists(sub);
        };
    }
}
