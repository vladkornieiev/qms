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

import java.util.*;
import java.util.stream.Collectors;

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
            syncMembers(group, request.getFieldIds(), orgId);
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
            List<UUID> newFieldIds = request.getFieldIds().orElse(List.of());
            syncMembers(group, newFieldIds, orgId);
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

    @Transactional(readOnly = true)
    public Map<UUID, Long> getDefinitionReferenceCounts(List<UUID> fieldIds) {
        if (fieldIds.isEmpty()) return Map.of();
        return definitionRepository.countValuesByFieldIds(fieldIds).stream()
                .collect(Collectors.toMap(
                        row -> UUID.fromString((String) row[0]),
                        row -> ((Number) row[1]).longValue()));
    }

    @Transactional(readOnly = true)
    public Map<UUID, Long> getGroupReferenceCounts(List<UUID> groupIds) {
        if (groupIds.isEmpty()) return Map.of();
        return groupRepository.countEntityAssignmentsByGroupIds(groupIds).stream()
                .collect(Collectors.toMap(
                        row -> UUID.fromString((String) row[0]),
                        row -> ((Number) row[1]).longValue()));
    }

    private void syncMembers(CustomFieldGroup group, List<UUID> desiredFieldIds, UUID orgId) {
        List<CustomFieldGroupMember> existing = memberRepository.findByCustomFieldGroupIdOrderByDisplayOrder(group.getId());
        Set<UUID> existingFieldIds = existing.stream()
                .map(m -> m.getCustomFieldDefinition().getId())
                .collect(Collectors.toSet());
        Set<UUID> desiredSet = new LinkedHashSet<>(desiredFieldIds);

        // Remove members no longer in the list
        existing.stream()
                .filter(m -> !desiredSet.contains(m.getCustomFieldDefinition().getId()))
                .forEach(memberRepository::delete);

        // Add new members and update display order
        for (int i = 0; i < desiredFieldIds.size(); i++) {
            UUID fieldId = desiredFieldIds.get(i);
            int displayOrder = i;
            if (!existingFieldIds.contains(fieldId)) {
                CustomFieldDefinition def = getDefinitionById(fieldId);
                CustomFieldGroupMember member = new CustomFieldGroupMember();
                member.setOrganizationId(orgId);
                member.setCustomFieldGroup(group);
                member.setCustomFieldDefinition(def);
                member.setDisplayOrder(displayOrder);
                memberRepository.save(member);
            } else {
                existing.stream()
                        .filter(m -> m.getCustomFieldDefinition().getId().equals(fieldId))
                        .findFirst()
                        .ifPresent(m -> {
                            m.setDisplayOrder(displayOrder);
                            memberRepository.save(m);
                        });
            }
        }
    }
}
