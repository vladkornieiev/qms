package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateCustomFieldDefinitionRequest;
import com.kfdlabs.asap.dto.UpdateCustomFieldDefinitionRequest;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.CustomFieldDefinitionRepository;
import com.kfdlabs.asap.repository.LookupListRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomFieldService {

    private final CustomFieldDefinitionRepository customFieldDefinitionRepository;
    private final LookupListRepository lookupListRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public List<CustomFieldDefinition> listDefinitions(String entityType) {
        return customFieldDefinitionRepository.findByOrganizationIdAndEntityTypeOrderByDisplayOrder(
                SecurityUtils.getCurrentOrganizationId(), entityType);
    }

    public CustomFieldDefinition getDefinition(UUID id) {
        CustomFieldDefinition def = customFieldDefinitionRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Custom field definition not found"));
        if (!def.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return def;
    }

    @SuppressWarnings("unchecked")
    public CustomFieldDefinition createDefinition(String entityType, CreateCustomFieldDefinitionRequest request) {
        CustomFieldDefinition def = new CustomFieldDefinition();
        def.setOrganization(getCurrentOrg());
        def.setEntityType(entityType);
        def.setFieldKey(request.getFieldKey());
        def.setFieldLabel(request.getFieldLabel());
        def.setFieldType(request.getFieldType());
        if (request.getOptions() != null) def.setOptions((List<Object>) (List<?>) request.getOptions());
        if (request.getLookupListId() != null) {
            def.setLookupList(lookupListRepository.findById(request.getLookupListId()).orElse(null));
        }
        if (request.getCollectionSchema() != null) def.setCollectionSchema((List<Object>) (List<?>) request.getCollectionSchema());
        if (request.getMinEntries() != null) def.setMinEntries(request.getMinEntries());
        if (request.getMaxEntries() != null) def.setMaxEntries(request.getMaxEntries());
        if (request.getIsRequired() != null) def.setIsRequired(request.getIsRequired());
        if (request.getDefaultValue() != null) def.setDefaultValue(request.getDefaultValue());
        if (request.getIsFilterable() != null) def.setIsFilterable(request.getIsFilterable());
        if (request.getDisplayOrder() != null) def.setDisplayOrder(request.getDisplayOrder());
        if (request.getSection() != null) def.setSection(request.getSection());
        if (request.getShowOnForm() != null) def.setShowOnForm(request.getShowOnForm());
        if (request.getShowOnCard() != null) def.setShowOnCard(request.getShowOnCard());
        return customFieldDefinitionRepository.save(def);
    }

    public CustomFieldDefinition updateDefinition(UUID id, UpdateCustomFieldDefinitionRequest request) {
        CustomFieldDefinition def = getDefinition(id);
        if (request.getFieldLabel() != null) def.setFieldLabel(request.getFieldLabel().orElse(def.getFieldLabel()));
        if (request.getIsRequired() != null) def.setIsRequired(request.getIsRequired().orElse(def.getIsRequired()));
        if (request.getDefaultValue() != null) def.setDefaultValue(request.getDefaultValue().orElse(def.getDefaultValue()));
        if (request.getIsFilterable() != null) def.setIsFilterable(request.getIsFilterable().orElse(def.getIsFilterable()));
        if (request.getDisplayOrder() != null) def.setDisplayOrder(request.getDisplayOrder().orElse(def.getDisplayOrder()));
        if (request.getSection() != null) def.setSection(request.getSection().orElse(def.getSection()));
        if (request.getShowOnForm() != null) def.setShowOnForm(request.getShowOnForm().orElse(def.getShowOnForm()));
        if (request.getShowOnCard() != null) def.setShowOnCard(request.getShowOnCard().orElse(def.getShowOnCard()));
        return customFieldDefinitionRepository.save(def);
    }

    public void deleteDefinition(UUID id) {
        CustomFieldDefinition def = getDefinition(id);
        customFieldDefinitionRepository.delete(def);
    }
}
