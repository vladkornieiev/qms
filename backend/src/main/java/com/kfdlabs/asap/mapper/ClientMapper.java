package com.kfdlabs.asap.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Client;
import com.kfdlabs.asap.entity.CustomFieldValue;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.service.EntityCustomFieldService;
import com.kfdlabs.asap.service.EntityTagService;
import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper(componentModel = "spring")
public abstract class ClientMapper {

    private static final ObjectMapper JSON = new ObjectMapper();

    @Autowired
    protected EntityTagService entityTagService;

    @Autowired
    protected EntityCustomFieldService entityCustomFieldService;

    public ClientResponse toClientResponse(Client entity) {
        ClientResponse response = new ClientResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setType(entity.getType());
        response.setEmail(entity.getEmail());
        response.setPhone(entity.getPhone());
        response.setWebsite(entity.getWebsite());
        response.setNotes(entity.getNotes());
        response.setExternalAccountingId(entity.getExternalAccountingId());
        response.setPricingTier(entity.getPricingTier());
        response.setIsActive(entity.getIsActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        // Tags
        List<Tag> tags = entityTagService.getEntityTagsBatch("CLIENT", List.of(entity.getId()))
                .getOrDefault(entity.getId(), List.of());
        response.setTags(tags.stream().map(this::toTagSummary).toList());

        // Custom field values
        List<CustomFieldValue> values = entityCustomFieldService.getEntityCustomFieldValues(entity.getId());
        response.setCustomFieldValues(values.stream().map(this::toCustomFieldValueResponse).toList());

        return response;
    }

    public ClientListItem toClientListItem(Client entity, Map<UUID, List<Tag>> tagsByEntity) {
        ClientListItem item = new ClientListItem();
        item.setId(entity.getId());
        item.setName(entity.getName());
        item.setType(entity.getType());
        item.setEmail(entity.getEmail());
        item.setPhone(entity.getPhone());
        item.setIsActive(entity.getIsActive());
        item.setCreatedAt(entity.getCreatedAt());

        List<Tag> tags = tagsByEntity.getOrDefault(entity.getId(), List.of());
        item.setTags(tags.stream().map(this::toTagSummary).toList());

        return item;
    }

    public PaginatedClientResponse toPaginatedResponse(Page<Client> page) {
        List<UUID> entityIds = page.getContent().stream().map(Client::getId).toList();
        Map<UUID, List<Tag>> tagsByEntity = entityTagService.getEntityTagsBatch("CLIENT", entityIds);

        PaginatedClientResponse response = new PaginatedClientResponse();
        response.setItems(page.getContent().stream()
                .map(c -> toClientListItem(c, tagsByEntity))
                .toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    private TagSummary toTagSummary(Tag tag) {
        TagSummary summary = new TagSummary();
        summary.setId(tag.getId());
        summary.setName(tag.getName());
        summary.setColor(tag.getColor());
        return summary;
    }

    private CustomFieldValueResponse toCustomFieldValueResponse(CustomFieldValue cfv) {
        CustomFieldValueResponse r = new CustomFieldValueResponse();
        r.setCustomFieldId(cfv.getCustomFieldDefinition().getId());
        r.setFieldKey(cfv.getCustomFieldDefinition().getFieldKey());
        r.setFieldLabel(cfv.getCustomFieldDefinition().getFieldLabel());
        r.setFieldType(cfv.getCustomFieldDefinition().getFieldType());
        r.setValue(parseJsonbValue(cfv.getValue()));
        return r;
    }

    /**
     * Parses a raw JSONB string into the appropriate Java type.
     * JSONB stores text values as {@code "\"John Smith\""} (with escaped quotes),
     * so we need to deserialize to unwrap them properly.
     */
    private static Object parseJsonbValue(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            return JSON.readValue(raw, Object.class);
        } catch (JsonProcessingException e) {
            // If parsing fails, return the raw string as-is
            return raw;
        }
    }

}
