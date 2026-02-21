package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.UserAuthMethods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserAuthMethodsRepository extends JpaRepository<UserAuthMethods, UUID> {

    @Query("SELECT uam FROM UserAuthMethods uam WHERE LOWER(uam.email) = lower(:email)")
    Optional<UserAuthMethods> findByEmail(@Param("email") String email);
}
