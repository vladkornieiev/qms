package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByIdAndIsActiveTrue(UUID id);

    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.twoFactorAuthEnabled = true")
    Optional<User> findByEmailAnd2FAEnabled(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.passwordHash IS NOT NULL")
    Optional<User> findByEmailWithPassword(@Param("email") String email);

    @Query("""
            SELECT u FROM User u
            WHERE u.isActive = true
            AND (:query = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<User> findAllUsers(@Param("query") String query, Pageable pageable);

    @Query("""
            SELECT u FROM User u
            JOIN u.organizationMemberships om
            WHERE om.organization.id = :organizationId
            AND om.isActive = true
            AND u.isActive = true
            AND (:query = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<User> findUsersByOrganization(@Param("organizationId") UUID organizationId,
                                       @Param("query") String query,
                                       Pageable pageable);
}
