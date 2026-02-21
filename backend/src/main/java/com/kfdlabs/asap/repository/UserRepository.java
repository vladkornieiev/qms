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

    @Query("""
            SELECT u FROM User u
            WHERE u.isActive = true
            AND (:query = '' OR (LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))))
            """)
    Page<User> findAllUsers(@Param("query") String query, Pageable pageable);

    @Query(value = """
            SELECT u.* FROM users u
            JOIN organization_members om ON om.user_id = u.id
            WHERE om.organization_id = :organizationId
            AND om.is_active = true
            AND u.is_active = true
            AND (:query = '' OR (LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.first_name) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.last_name) LIKE LOWER(CONCAT('%', :query, '%'))))
            """,
            countQuery = """
            SELECT COUNT(*) FROM users u
            JOIN organization_members om ON om.user_id = u.id
            WHERE om.organization_id = :organizationId
            AND om.is_active = true
            AND u.is_active = true
            AND (:query = '' OR (LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.first_name) LIKE LOWER(CONCAT('%', :query, '%'))
                             OR LOWER(u.last_name) LIKE LOWER(CONCAT('%', :query, '%'))))
            """,
            nativeQuery = true)
    Page<User> findUsersByOrganization(@Param("organizationId") UUID organizationId,
                                       @Param("query") String query,
                                       Pageable pageable);
}
