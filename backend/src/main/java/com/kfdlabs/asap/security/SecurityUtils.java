package com.kfdlabs.asap.security;

import com.kfdlabs.asap.entity.OrganizationRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class SecurityUtils {

    public static String getCurrentUserEmail() {
        AuthenticatedUser authenticatedUser = getCurrentAuthenticatedUser();
        return authenticatedUser.getEmail();
    }

    public static boolean isPlatformAdmin() {
        AuthenticatedUser authenticatedUser = getCurrentAuthenticatedUser();
        return authenticatedUser.getRoles().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_PLATFORM_ADMIN"));
    }

    public static boolean isOwner() {
        AuthenticatedUser authenticatedUser = getCurrentAuthenticatedUser();
        return authenticatedUser.getRoles().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_OWNER")
                        || role.getAuthority().equals("ROLE_PLATFORM_ADMIN"));
    }

    public static boolean isAdmin() {
        AuthenticatedUser authenticatedUser = getCurrentAuthenticatedUser();
        return authenticatedUser.getRoles().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_OWNER")
                        || role.getAuthority().equals("ROLE_ADMIN")
                        || role.getAuthority().equals("ROLE_PLATFORM_ADMIN"));
    }

    public static boolean hasAnyRole(List<OrganizationRole> roles) {
        AuthenticatedUser authenticatedUser = getCurrentAuthenticatedUser();
        Set<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
        return authenticatedUser.getRoles().stream()
                .anyMatch(authorities::contains);
    }

    public static UUID getCurrentUserId() {
        AuthenticatedUser authenticatedUser = getCurrentAuthenticatedUser();
        return authenticatedUser.getUserId();
    }

    public static UUID getCurrentOrganizationId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "error.user.not.authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedApiKey) {
            return ((AuthenticatedApiKey) principal).getOrganizationId();
        } else if (principal instanceof AuthenticatedUser) {
            return ((AuthenticatedUser) principal).getOrganizationId();
        } else {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "error.user.invalid.authentication.principal");
        }
    }

    public static Optional<UUID> getCurrentUserIdOptional() {
        try {
            return Optional.of(getCurrentUserId());
        } catch (HttpClientErrorException e) {
            return Optional.empty();
        }
    }

    public static AuthenticatedUser getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "error.user.not.authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AuthenticatedUser)) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "error.user.invalid.authentication.principal");
        }

        return (AuthenticatedUser) principal;
    }

    public static AuthenticatedApiKey getCurrentAuthenticatedApiKey() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "error.user.not.authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AuthenticatedApiKey)) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "error.api.key.invalid.authentication.principal");
        }

        return (AuthenticatedApiKey) principal;
    }
}
