package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedUserResponse;
import com.kfdlabs.asap.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.net.URI;

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

    protected URI stringToUri(String value) {
        if (value == null || value.isBlank()) return null;
        return URI.create(value);
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
}
