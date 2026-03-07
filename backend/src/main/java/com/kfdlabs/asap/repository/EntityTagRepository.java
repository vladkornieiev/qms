package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.EntityTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityTagRepository extends JpaRepository<EntityTag, UUID> {

    List<EntityTag> findByEntityTypeAndEntityId(String entityType, UUID entityId);

    List<EntityTag> findByOrganizationIdAndEntityTypeAndEntityId(UUID organizationId, String entityType, UUID entityId);

    @Query(value = "SELECT CAST(et.tag_id AS VARCHAR), COUNT(*) FROM entity_tags et WHERE et.tag_id IN :tagIds GROUP BY et.tag_id", nativeQuery = true)
    List<Object[]> countByTagIds(@Param("tagIds") List<UUID> tagIds);

    @Query(value = "SELECT CAST(tgm.tag_group_id AS VARCHAR), COUNT(et.id) FROM tag_group_members tgm LEFT JOIN entity_tags et ON et.tag_id = tgm.tag_id WHERE tgm.tag_group_id IN :groupIds GROUP BY tgm.tag_group_id", nativeQuery = true)
    List<Object[]> countByTagGroupIds(@Param("groupIds") List<UUID> groupIds);
}
