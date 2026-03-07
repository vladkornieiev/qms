package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.CustomFieldDefinitionResponse;
import com.kfdlabs.asap.dto.CustomFieldGroupResponse;
import com.kfdlabs.asap.dto.PaginatedCustomFieldDefinitionResponse;
import com.kfdlabs.asap.dto.PaginatedCustomFieldGroupResponse;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import com.kfdlabs.asap.entity.CustomFieldGroup;
import com.kfdlabs.asap.entity.CustomFieldGroupMember;
import com.kfdlabs.asap.service.CustomFieldService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper(componentModel = "spring")
public abstract class CustomFieldMapper {

    @Autowired
    protected CustomFieldService customFieldService;

    @Mapping(target = "referenceCount", ignore = true)
    public abstract CustomFieldDefinitionResponse toDefinitionDTO(CustomFieldDefinition entity);

    public CustomFieldGroupResponse toGroupDTO(CustomFieldGroup entity) {
        List<CustomFieldGroupMember> members = customFieldService.getGroupMembers(entity.getId());
        Map<UUID, Long> refCounts = customFieldService.getGroupReferenceCounts(List.of(entity.getId()));
        CustomFieldGroupResponse response = new CustomFieldGroupResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setEntityType(entity.getEntityType());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setReferenceCount(refCounts.getOrDefault(entity.getId(), 0L));
        response.setFields(members.stream()
                .map(m -> toDefinitionDTO(m.getCustomFieldDefinition()))
                .toList());
        return response;
    }

    public PaginatedCustomFieldDefinitionResponse toPaginatedDefinitionDTO(Page<CustomFieldDefinition> page) {
        List<UUID> fieldIds = page.getContent().stream().map(CustomFieldDefinition::getId).toList();
        Map<UUID, Long> refCounts = customFieldService.getDefinitionReferenceCounts(fieldIds);
        PaginatedCustomFieldDefinitionResponse response = new PaginatedCustomFieldDefinitionResponse();
        response.setItems(page.getContent().stream().map(d -> {
            CustomFieldDefinitionResponse dto = toDefinitionDTO(d);
            dto.setReferenceCount(refCounts.getOrDefault(d.getId(), 0L));
            return dto;
        }).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedCustomFieldGroupResponse toPaginatedGroupDTO(Page<CustomFieldGroup> page) {
        List<UUID> groupIds = page.getContent().stream().map(CustomFieldGroup::getId).toList();
        Map<UUID, Long> refCounts = customFieldService.getGroupReferenceCounts(groupIds);
        PaginatedCustomFieldGroupResponse response = new PaginatedCustomFieldGroupResponse();
        response.setItems(page.getContent().stream()
                .map(g -> {
                    List<CustomFieldGroupMember> members = customFieldService.getGroupMembers(g.getId());
                    CustomFieldGroupResponse dto = new CustomFieldGroupResponse();
                    dto.setId(g.getId());
                    dto.setName(g.getName());
                    dto.setDescription(g.getDescription());
                    dto.setEntityType(g.getEntityType());
                    dto.setCreatedAt(g.getCreatedAt());
                    dto.setUpdatedAt(g.getUpdatedAt());
                    dto.setReferenceCount(refCounts.getOrDefault(g.getId(), 0L));
                    dto.setFields(members.stream()
                            .map(m -> toDefinitionDTO(m.getCustomFieldDefinition()))
                            .toList());
                    return dto;
                })
                .toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
