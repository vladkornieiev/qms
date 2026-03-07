package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateCustomFieldDefinitionRequest;
import com.kfdlabs.asap.dto.CreateCustomFieldGroupRequest;
import com.kfdlabs.asap.dto.UpdateCustomFieldDefinitionRequest;
import com.kfdlabs.asap.dto.UpdateCustomFieldGroupRequest;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import com.kfdlabs.asap.entity.CustomFieldGroup;
import com.kfdlabs.asap.entity.CustomFieldGroupMember;
import com.kfdlabs.asap.repository.CustomFieldDefinitionRepository;
import com.kfdlabs.asap.repository.CustomFieldGroupMemberRepository;
import com.kfdlabs.asap.repository.CustomFieldGroupRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

import static org.openapitools.jackson.nullable.JsonNullable.undefined;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomFieldService {

    private final CustomFieldDefinitionRepository definitionRepository;
    private final CustomFieldGroupRepository groupRepository;
    private final CustomFieldGroupMemberRepository memberRepository;

    // ---- Definitions ----

    public CustomFieldDefinition createDefinition(CreateCustomFieldDefinitionRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        definitionRepository.findByOrganizationIdAndFieldKey(orgId, request.getFieldKey())
                .ifPresent(existing -> {
                    throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.custom_field.key.conflict");
                });

        CustomFieldDefinition def = new CustomFieldDefinition();
        def.setOrganizationId(orgId);
        def.setFieldKey(request.getFieldKey());
        def.setFieldLabel(request.getFieldLabel());
        def.setFieldType(request.getFieldType().getValue());
        def.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
        def.setOptions(request.getOptions());
        def.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        return definitionRepository.save(def);
    }

    @Transactional(readOnly = true)
    public CustomFieldDefinition getDefinitionById(UUID id) {
        return definitionRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.custom_field.not.found"));
    }

    public CustomFieldDefinition updateDefinition(UUID id, UpdateCustomFieldDefinitionRequest request) {
        CustomFieldDefinition def = getDefinitionById(id);

        if (request.getFieldLabel() != null && !request.getFieldLabel().equals(undefined())) {
            def.setFieldLabel(request.getFieldLabel().orElse(""));
        }
        if (request.getFieldType() != null && !request.getFieldType().equals(undefined())) {
            def.setFieldType(request.getFieldType().get().getValue());
        }
        if (request.getIsRequired() != null && !request.getIsRequired().equals(undefined())) {
            def.setIsRequired(request.getIsRequired().orElse(false));
        }
        if (request.getOptions() != null && !request.getOptions().equals(undefined())) {
            def.setOptions(request.getOptions().orElse(null));
        }
        if (request.getDisplayOrder() != null && !request.getDisplayOrder().equals(undefined())) {
            def.setDisplayOrder(request.getDisplayOrder().orElse(0));
        }
        return definitionRepository.save(def);
    }

    public void deleteDefinition(UUID id) {
        if (!definitionRepository.existsById(id)) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.custom_field.not.found");
        }
        definitionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<CustomFieldDefinition> findAllDefinitions(String query, Integer page, Integer size, String sortBy, String order) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return definitionRepository.findAll(orgId, query == null ? "" : query,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }

    // ---- Groups ----

    public CustomFieldGroup createGroup(CreateCustomFieldGroupRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        groupRepository.findByOrganizationIdAndName(orgId, request.getName())
                .ifPresent(existing -> {
                    throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.custom_field_group.name.conflict");
                });

        CustomFieldGroup group = new CustomFieldGroup();
        group.setOrganizationId(orgId);
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setEntityType(request.getEntityType());
        group = groupRepository.save(group);

        if (request.getFieldIds() != null) {
            saveMembers(group, request.getFieldIds(), orgId);
        }
        return group;
    }

    @Transactional(readOnly = true)
    public CustomFieldGroup getGroupById(UUID id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.custom_field_group.not.found"));
    }

    public List<CustomFieldGroupMember> getGroupMembers(UUID groupId) {
        return memberRepository.findByCustomFieldGroupIdOrderByDisplayOrder(groupId);
    }

    public CustomFieldGroup updateGroup(UUID id, UpdateCustomFieldGroupRequest request) {
        CustomFieldGroup group = getGroupById(id);
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        if (request.getName() != null && !request.getName().equals(undefined())) {
            String name = request.getName().orElse("");
            groupRepository.findByOrganizationIdAndName(orgId, name)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.custom_field_group.name.conflict");
                    });
            group.setName(name);
        }
        if (request.getDescription() != null && !request.getDescription().equals(undefined())) {
            group.setDescription(request.getDescription().orElse(null));
        }
        if (request.getFieldIds() != null && !request.getFieldIds().equals(undefined())) {
            memberRepository.deleteByCustomFieldGroupId(id);
            List<UUID> fieldIds = request.getFieldIds().orElse(List.of());
            saveMembers(group, fieldIds, orgId);
        }
        return groupRepository.save(group);
    }

    public void deleteGroup(UUID id) {
        if (!groupRepository.existsById(id)) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.custom_field_group.not.found");
        }
        groupRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<CustomFieldGroup> findAllGroups(String query, String entityType, Integer page, Integer size, String sortBy, String order) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return groupRepository.findAll(orgId, query == null ? "" : query,
                entityType == null ? "" : entityType,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }

    private void saveMembers(CustomFieldGroup group, List<UUID> fieldIds, UUID orgId) {
        for (int i = 0; i < fieldIds.size(); i++) {
            CustomFieldDefinition def = getDefinitionById(fieldIds.get(i));
            CustomFieldGroupMember member = new CustomFieldGroupMember();
            member.setOrganizationId(orgId);
            member.setCustomFieldGroup(group);
            member.setCustomFieldDefinition(def);
            member.setDisplayOrder(i);
            memberRepository.save(member);
        }
    }
}
