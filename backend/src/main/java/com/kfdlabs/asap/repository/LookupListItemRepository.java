package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.LookupListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LookupListItemRepository extends JpaRepository<LookupListItem, UUID> {
    List<LookupListItem> findByLookupListIdOrderByDisplayOrder(UUID lookupListId);
    List<LookupListItem> findByLookupListIdAndIsActiveTrueOrderByDisplayOrder(UUID lookupListId);
}
