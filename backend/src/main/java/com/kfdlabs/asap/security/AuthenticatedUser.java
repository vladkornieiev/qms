package com.kfdlabs.asap.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthenticatedUser {
    private UUID organizationId;
    private String email;
    private UUID userId;
    private List<GrantedAuthority> roles;
}
