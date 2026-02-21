package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDetailsRepository extends JpaRepository<UserDetails, UUID> {

    @Query("SELECT ud FROM UserDetails ud WHERE LOWER(ud.email) = LOWER(:email)")
    Optional<UserDetails> findByEmail(String email);

    @Query("SELECT ud FROM UserDetails ud WHERE LOWER(ud.email) = LOWER(:email) AND ud.twoFactorAuthEnabled = true")
    Optional<UserDetails> findByEmailAnd2FAEnabled(@Param("email") String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT ud FROM UserDetails ud WHERE LOWER(ud.email) = LOWER(:email) AND ud.password IS NOT NULL")
    Optional<UserDetails> findByEmailWithPassword(@Param("email") String email);
}
