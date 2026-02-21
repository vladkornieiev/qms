package com.kfdlabs.asap.security;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthenticatedApiKey {
    private UUID organizationId;
    private UUID apiKeyId;
}
