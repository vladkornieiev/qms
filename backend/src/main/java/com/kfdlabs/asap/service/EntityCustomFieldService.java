package com.kfdlabs.asap.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import com.kfdlabs.asap.entity.CustomFieldGroup;
import com.kfdlabs.asap.entity.CustomFieldValue;
import com.kfdlabs.asap.entity.EntityCustomFieldGroup;
import com.kfdlabs.asap.repository.CustomFieldDefinitionRepository;
import com.kfdlabs.asap.repository.CustomFieldGroupRepository;
import com.kfdlabs.asap.repository.CustomFieldValueRepository;
import com.kfdlabs.asap.repository.EntityCustomFieldGroupRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EntityCustomFieldService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final EntityCustomFieldGroupRepository ecfgRepository;
    private final CustomFieldValueRepository cfvRepository;
    private final CustomFieldGroupRepository customFieldGroupRepository;
    private final CustomFieldDefinitionRepository customFieldDefinitionRepository;

    @Transactional(readOnly = true)
    public List<CustomFieldValue> getEntityCustomFieldValues(UUID entityId) {
        return cfvRepository.findByEntityId(entityId);
    }

    public void setEntityCustomFieldValues(UUID entityId, List<CustomFieldValueInput> values) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        if (values == null || values.isEmpty()) return;

        for (CustomFieldValueInput input : values) {
            String jsonValue = toJsonb(input.value());
            Optional<CustomFieldValue> existing = cfvRepository
                    .findByCustomFieldDefinitionIdAndEntityId(input.customFieldId(), entityId);
            if (existing.isPresent()) {
                CustomFieldValue cfv = existing.get();
                cfv.setValue(jsonValue);
                cfvRepository.save(cfv);
            } else {
                CustomFieldDefinition def = customFieldDefinitionRepository
                        .findById(input.customFieldId()).orElse(null);
                if (def == null) continue;
                CustomFieldValue cfv = new CustomFieldValue();
                cfv.setOrganizationId(orgId);
                cfv.setCustomFieldDefinition(def);
                cfv.setEntityId(entityId);
                cfv.setValue(jsonValue);
                cfvRepository.save(cfv);
            }
        }
    }

    /**
     * Serialize a value to a JSONB-compatible string.
     * Strings become {@code "\"text\""}, numbers stay as {@code "123"}, etc.
     */
    private static String toJsonb(Object value) {
        if (value == null) return null;
        try {
            return JSON.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            // Fallback: wrap as JSON string
            return "\"" + value + "\"";
        }
    }

    public record CustomFieldValueInput(UUID customFieldId, Object value) {}
}
