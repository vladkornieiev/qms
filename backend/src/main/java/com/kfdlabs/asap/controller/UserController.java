package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.UsersApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.UserAuthMethodsMapper;
import com.kfdlabs.asap.mapper.UserEmailPreferencesMapper;
import com.kfdlabs.asap.mapper.UserMapper;
import com.kfdlabs.asap.service.UserEmailPreferencesService;
import com.kfdlabs.asap.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.kfdlabs.asap.security.SecurityUtils.*;

@Slf4j
@Controller
@RequiredArgsConstructor
public class UserController implements UsersApi {

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserEmailPreferencesService userEmailPreferencesService;
    private final UserEmailPreferencesMapper userEmailPreferencesMapper;
    private final UserAuthMethodsMapper userAuthMethodsMapper;

    @Override
    public ResponseEntity<CurrentUser> getCurrentUser() {
        var user = userService.getUserByEmail(getCurrentUserEmail());
        var dto = userMapper.toCurrentUserDTO(user);
        dto.setOrganizationId(getCurrentOrganizationId());
        String role = userService.getUserRoleInOrganization(user.getId(), getCurrentOrganizationId());
        if (role != null) {
            dto.setRoles(List.of(UserRole.fromValue(role.toUpperCase())));
        }
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<CurrentUser> updateCurrentUser(UpdateUserRequest updateUserRequest) {
        var user = userService.updateUser(getCurrentUserId(), updateUserRequest);
        var dto = userMapper.toCurrentUserDTO(user);
        dto.setOrganizationId(getCurrentOrganizationId());
        String role = userService.getUserRoleInOrganization(user.getId(), getCurrentOrganizationId());
        if (role != null) {
            dto.setRoles(List.of(UserRole.fromValue(role.toUpperCase())));
        }
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<UserEmailPreferences> getCurrentUserEmailPreferences() {
        var prefs = userEmailPreferencesService.getCurrentUserPreferences();
        return ResponseEntity.ok(userEmailPreferencesMapper.toDto(prefs));
    }

    @Override
    public ResponseEntity<UserEmailPreferences> updateCurrentUserEmailPreferences(Map<String, Object> preferences) {
        var updated = userEmailPreferencesService.updateCurrentUserPreferences(preferences);
        return ResponseEntity.ok(userEmailPreferencesMapper.toDto(updated));
    }

    @Override
    public ResponseEntity<UserEmailPreferences> updatePublicUserEmailPreferences(String token, Map<String, Object> preferences) {
        var email = userEmailPreferencesService.validateAndExtractEmailFromToken(token);
        var updated = userEmailPreferencesService.updatePreferencesForUser(email, preferences);
        return ResponseEntity.ok(userEmailPreferencesMapper.toDto(updated));
    }

    @Override
    public ResponseEntity<UserEmailPreferences> getPublicUserEmailPreferences(String token) {
        var email = userEmailPreferencesService.validateAndExtractEmailFromToken(token);
        var prefs = userEmailPreferencesService.getPreferencesForUser(email);
        return ResponseEntity.ok(userEmailPreferencesMapper.toDto(prefs));
    }

    @Override
    public ResponseEntity<UserAuthMethods> getCurrentUserAuthMethods() {
        var authMethods = userService.getCurrentUserAuthMethods();
        return ResponseEntity.ok(userAuthMethodsMapper.toDto(authMethods));
    }

    @Override
    public ResponseEntity<UserAuthMethods> updateCurrentUserAuthMethods(UpdateAuthMethodsRequest updateAuthMethodsRequest) {
        var updated = userService.updateCurrentUserAuthMethods(updateAuthMethodsRequest);
        return ResponseEntity.ok(userAuthMethodsMapper.toDto(updated));
    }

    @Override
    public ResponseEntity<Void> updateCurrentUserPassword(UpdatePasswordRequest updatePasswordRequest) {
        userService.updateCurrentUserPassword(updatePasswordRequest);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<User> createAdminUser(CreateUserRequest createUserRequest) {
        return ResponseEntity.ok(userMapper.toDTO(userService.createUser(createUserRequest)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<User> createUser(CreateUserRequest createUserRequest) {
        createUserRequest.setOrganizationId(getCurrentOrganizationId());
        return ResponseEntity.ok(userMapper.toDTO(userService.createUser(createUserRequest)));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteAdminUserById(UUID id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteUserById(UUID id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<PaginatedUserResponse> findAdminUsers(
            String query, UUID organizationId, String organizationName,
            Integer page, Integer size, String sortBy, String order) {
        var users = userService.findAllUsers(query, page, size, sortBy, order);
        return ResponseEntity.ok(userMapper.toPaginatedDTO(users));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<PaginatedUserResponse> findUsers(
            String query, Integer page, Integer size, String sortBy, String order) {
        var users = userService.findUsersByOrganization(getCurrentOrganizationId(), query, page, size, sortBy, order);
        return ResponseEntity.ok(userMapper.toPaginatedDTO(users));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<User> getAdminUserById(UUID id) {
        return ResponseEntity.ok(userMapper.toDTO(userService.getUserById(id)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<User> getUserById(UUID id) {
        return ResponseEntity.ok(userMapper.toDTO(userService.getUserById(id)));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<User> updateAdminUser(UUID id, UpdateUserRequest updateUserRequest) {
        return ResponseEntity.ok(userMapper.toDTO(userService.updateUser(id, updateUserRequest)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<User> updateUser(UUID id, UpdateUserRequest updateUserRequest) {
        return ResponseEntity.ok(userMapper.toDTO(userService.updateUser(id, updateUserRequest)));
    }
}
