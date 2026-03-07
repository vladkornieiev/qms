package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedUserResponse;
import com.kfdlabs.asap.dto.UserRole;
import com.kfdlabs.asap.entity.OrganizationMember;
import com.kfdlabs.asap.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "twoFactorAuthEnabled", ignore = true)
    @Mapping(target = "avatarUrl", expression = "java(stringToUri(entity.getAvatarUrl()))")
    public abstract com.kfdlabs.asap.dto.User toDTO(User entity);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "twoFactorAuthEnabled", ignore = true)
    @Mapping(target = "organizationId", ignore = true)
    @Mapping(target = "avatarUrl", expression = "java(stringToUri(entity.getAvatarUrl()))")
    public abstract com.kfdlabs.asap.dto.CurrentUser toCurrentUserDTO(User entity);

    public com.kfdlabs.asap.dto.User toDTOWithRole(User entity, UUID organizationId) {
        com.kfdlabs.asap.dto.User dto = toDTO(entity);
        populateRoleFromEntity(dto, entity, organizationId);
        return dto;
    }

    public com.kfdlabs.asap.dto.CurrentUser toCurrentUserDTOWithRole(User entity, UUID organizationId) {
        com.kfdlabs.asap.dto.CurrentUser dto = toCurrentUserDTO(entity);
        dto.setOrganizationId(organizationId);
        populateRoleFromEntity(dto, entity, organizationId);
        return dto;
    }

    public PaginatedUserResponse toPaginatedDTO(Page<User> users) {
        PaginatedUserResponse response = new PaginatedUserResponse();
        response.setItems(users.getContent().stream().map(this::toDTO).toList());
        response.setPage(users.getNumber());
        response.setSize(users.getSize());
        response.setTotalElements(users.getTotalElements());
        response.setTotalPages(users.getTotalPages());
        return response;
    }

    public PaginatedUserResponse toPaginatedDTOWithRoles(Page<User> users, UUID organizationId) {
        PaginatedUserResponse response = new PaginatedUserResponse();
        response.setItems(users.getContent().stream()
                .map(u -> toDTOWithRole(u, organizationId))
                .toList());
        response.setPage(users.getNumber());
        response.setSize(users.getSize());
        response.setTotalElements(users.getTotalElements());
        response.setTotalPages(users.getTotalPages());
        return response;
    }

    protected URI stringToUri(String value) {
        if (value == null || value.isBlank()) return null;
        return URI.create(value);
    }

    private void populateRoleFromEntity(com.kfdlabs.asap.dto.User dto, User entity, UUID organizationId) {
        if (organizationId == null || entity.getOrganizationMemberships() == null) return;
        entity.getOrganizationMemberships().stream()
                .filter(om -> om.getOrganization().getId().equals(organizationId) && om.getIsActive())
                .findFirst()
                .map(OrganizationMember::getRole)
                .ifPresent(role -> dto.setRoles(List.of(UserRole.fromValue(role.name()))));
    }

    private void populateRoleFromEntity(com.kfdlabs.asap.dto.CurrentUser dto, User entity, UUID organizationId) {
        if (organizationId == null || entity.getOrganizationMemberships() == null) return;
        entity.getOrganizationMemberships().stream()
                .filter(om -> om.getOrganization().getId().equals(organizationId) && om.getIsActive())
                .findFirst()
                .map(OrganizationMember::getRole)
                .ifPresent(role -> dto.setRoles(List.of(UserRole.fromValue(role.name()))));
    }
}
