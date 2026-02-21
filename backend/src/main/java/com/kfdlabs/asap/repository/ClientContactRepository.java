package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ClientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClientContactRepository extends JpaRepository<ClientContact, UUID> {
    List<ClientContact> findByClientId(UUID clientId);
}
