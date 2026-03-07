package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CustomFieldGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomFieldGroupMemberRepository extends JpaRepository<CustomFieldGroupMember, UUID> {

    @Query("""
            SELECT m FROM CustomFieldGroupMember m
            JOIN FETCH m.customFieldDefinition
            WHERE m.customFieldGroup.id = :groupId
            ORDER BY m.displayOrder
            """)
    List<CustomFieldGroupMember> findByCustomFieldGroupIdOrderByDisplayOrder(@Param("groupId") UUID customFieldGroupId);

    void deleteByCustomFieldGroupId(UUID customFieldGroupId);
}
