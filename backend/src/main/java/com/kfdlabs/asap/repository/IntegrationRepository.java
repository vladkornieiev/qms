package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, UUID> {

    @Query("SELECT i FROM Integration i WHERE i.organization.id = :orgId ORDER BY i.provider ASC")
    List<Integration> findAll(UUID orgId);

    @Query("SELECT i FROM Integration i WHERE i.organization.id = :orgId AND i.provider = :provider")
    Optional<Integration> findByProvider(UUID orgId, String provider);

    @Query("SELECT i FROM Integration i WHERE i.status = 'connected'")
    List<Integration> findAllConnected();
}
