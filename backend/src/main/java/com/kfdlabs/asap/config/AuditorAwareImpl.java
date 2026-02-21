package com.kfdlabs.asap.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class AuditorAwareImpl implements AuditorAware<UUID> {

    @Override
    public Optional<UUID> getCurrentAuditor() {
        return com.kfdlabs.asap.security.SecurityUtils.getCurrentUserIdOptional();
    }
} 