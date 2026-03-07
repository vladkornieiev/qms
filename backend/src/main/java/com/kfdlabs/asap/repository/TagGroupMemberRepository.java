package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.TagGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TagGroupMemberRepository extends JpaRepository<TagGroupMember, UUID> {

    @Query("""
            SELECT m FROM TagGroupMember m
            JOIN FETCH m.tag
            WHERE m.tagGroup.id = :groupId
            ORDER BY m.displayOrder
            """)
    List<TagGroupMember> findByTagGroupIdOrderByDisplayOrder(@Param("groupId") UUID tagGroupId);

    @Modifying
    @Query("DELETE FROM TagGroupMember m WHERE m.tagGroup.id = :groupId")
    void deleteByTagGroupId(@Param("groupId") UUID groupId);
}
