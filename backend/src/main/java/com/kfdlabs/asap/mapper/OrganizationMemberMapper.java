package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedOrganizationMemberResponse;
import com.kfdlabs.asap.dto.UserRole;
import com.kfdlabs.asap.entity.OrganizationMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class OrganizationMemberMapper {

    @Mapping(target = "organizationId", source = "organization.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userFirstName", source = "user.firstName")
    @Mapping(target = "userLastName", source = "user.lastName")
    @Mapping(target = "role", expression = "java(mapRole(entity.getRole()))")
    public abstract com.kfdlabs.asap.dto.OrganizationMember toDTO(OrganizationMember entity);

    protected UserRole mapRole(String role) {
        return UserRole.fromValue(role.toUpperCase());
    }

    public PaginatedOrganizationMemberResponse toPaginatedDTO(Page<OrganizationMember> members) {
        PaginatedOrganizationMemberResponse response = new PaginatedOrganizationMemberResponse();
        response.setItems(members.getContent().stream().map(this::toDTO).toList());
        response.setPage(members.getNumber());
        response.setSize(members.getSize());
        response.setTotalElements(members.getTotalElements());
        response.setTotalPages(members.getTotalPages());
        return response;
    }
}
