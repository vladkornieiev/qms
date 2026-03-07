package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.EntityTag;
import com.kfdlabs.asap.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityTagRepository extends JpaRepository<EntityTag, UUID> {

    @Query("SELECT et FROM EntityTag et JOIN FETCH et.tag WHERE et.entityType = :entityType AND et.entityId = :entityId")
    List<EntityTag> findByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") UUID entityId);

    @Query("SELECT et FROM EntityTag et JOIN FETCH et.tag WHERE et.organizationId = :organizationId AND et.entityType = :entityType AND et.entityId = :entityId")
    List<EntityTag> findByOrganizationIdAndEntityTypeAndEntityId(@Param("organizationId") UUID organizationId, @Param("entityType") String entityType, @Param("entityId") UUID entityId);

    @Query(value = "SELECT CAST(et.tag_id AS VARCHAR), COUNT(*) FROM entity_tags et WHERE et.tag_id IN :tagIds GROUP BY et.tag_id", nativeQuery = true)
    List<Object[]> countByTagIds(@Param("tagIds") List<UUID> tagIds);

    @Query(value = "SELECT CAST(tgm.tag_group_id AS VARCHAR), COUNT(et.id) FROM tag_group_members tgm LEFT JOIN entity_tags et ON et.tag_id = tgm.tag_id WHERE tgm.tag_group_id IN :groupIds GROUP BY tgm.tag_group_id", nativeQuery = true)
    List<Object[]> countByTagGroupIds(@Param("groupIds") List<UUID> groupIds);

    @Query("SELECT et FROM EntityTag et JOIN FETCH et.tag WHERE et.entityType = :entityType AND et.entityId IN :entityIds")
    List<EntityTag> findByEntityTypeAndEntityIdIn(@Param("entityType") String entityType, @Param("entityIds") List<UUID> entityIds);

    void deleteByEntityTypeAndEntityId(String entityType, UUID entityId);

    @Query("SELECT DISTINCT t FROM EntityTag et JOIN et.tag t WHERE et.entityType = :entityType AND et.organizationId = :organizationId ORDER BY t.name")
    List<Tag> findDistinctTagsByEntityType(@Param("entityType") String entityType, @Param("organizationId") UUID organizationId);

    @Query("SELECT DISTINCT t FROM EntityTag et JOIN et.tag t WHERE et.organizationId = :organizationId ORDER BY t.name")
    List<Tag> findDistinctTagsInUse(@Param("organizationId") UUID organizationId);
}
