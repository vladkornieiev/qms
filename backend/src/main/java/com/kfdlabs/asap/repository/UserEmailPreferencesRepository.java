package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.UserEmailPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserEmailPreferencesRepository extends JpaRepository<UserEmailPreferences, UUID> {
    Optional<UserEmailPreferences> findByEmail(String email);
}


