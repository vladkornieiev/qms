package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.CustomFieldDefinitionResponse;
import com.kfdlabs.asap.dto.CustomFieldGroupResponse;
import com.kfdlabs.asap.dto.PaginatedCustomFieldDefinitionResponse;
import com.kfdlabs.asap.dto.PaginatedCustomFieldGroupResponse;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import com.kfdlabs.asap.entity.CustomFieldGroup;
import com.kfdlabs.asap.entity.CustomFieldGroupMember;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class CustomFieldMapper {

    public abstract CustomFieldDefinitionResponse toDefinitionDTO(CustomFieldDefinition entity);

    public CustomFieldGroupResponse toGroupDTO(CustomFieldGroup entity, List<CustomFieldGroupMember> members) {
        CustomFieldGroupResponse response = new CustomFieldGroupResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setEntityType(entity.getEntityType());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setFields(members.stream()
                .map(m -> toDefinitionDTO(m.getCustomFieldDefinition()))
                .toList());
        return response;
    }

    public PaginatedCustomFieldDefinitionResponse toPaginatedDefinitionDTO(Page<CustomFieldDefinition> page) {
        PaginatedCustomFieldDefinitionResponse response = new PaginatedCustomFieldDefinitionResponse();
        response.setItems(page.getContent().stream().map(this::toDefinitionDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedCustomFieldGroupResponse toPaginatedGroupDTO(Page<CustomFieldGroup> page,
                                                                  java.util.function.Function<java.util.UUID, List<CustomFieldGroupMember>> membersFetcher) {
        PaginatedCustomFieldGroupResponse response = new PaginatedCustomFieldGroupResponse();
        response.setItems(page.getContent().stream()
                .map(g -> toGroupDTO(g, membersFetcher.apply(g.getId())))
                .toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
