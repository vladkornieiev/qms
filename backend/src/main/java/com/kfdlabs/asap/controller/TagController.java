package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.TagsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.TagMapper;
import com.kfdlabs.asap.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class TagController implements TagsApi {

    private final TagService tagService;
    private final TagMapper tagMapper;

    @Override
    public ResponseEntity<PaginatedTagGroupResponse> listTagGroups(
            String query, Integer page, Integer size, String sortBy, String order) {
        var groups = tagService.findAllTagGroups(query, page, size, sortBy, order);
        return ResponseEntity.ok(tagMapper.toPaginatedTagGroupDTO(groups));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<TagGroupResponse> createTagGroup(CreateTagGroupRequest request) {
        var group = tagService.createTagGroup(request);
        return ResponseEntity.status(201).body(tagMapper.toTagGroupDTO(group));
    }

    @Override
    public ResponseEntity<TagGroupResponse> getTagGroup(UUID id) {
        return ResponseEntity.ok(tagMapper.toTagGroupDTO(tagService.getTagGroupById(id)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<TagGroupResponse> updateTagGroup(UUID id, UpdateTagGroupRequest request) {
        return ResponseEntity.ok(tagMapper.toTagGroupDTO(tagService.updateTagGroup(id, request)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteTagGroup(UUID id) {
        tagService.deleteTagGroup(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<PaginatedTagResponse> listTags(
            String query, UUID tagGroupId, Integer page, Integer size, String sortBy, String order) {
        var tags = tagService.findAllTags(query, tagGroupId, page, size, sortBy, order);
        return ResponseEntity.ok(tagMapper.toPaginatedTagDTO(tags));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<TagResponse> createTag(CreateTagRequest request) {
        var tag = tagService.createTag(request);
        return ResponseEntity.status(201).body(tagMapper.toTagDTO(tag));
    }

    @Override
    public ResponseEntity<TagResponse> getTag(UUID id) {
        return ResponseEntity.ok(tagMapper.toTagDTO(tagService.getTagById(id)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<TagResponse> updateTag(UUID id, UpdateTagRequest request) {
        return ResponseEntity.ok(tagMapper.toTagDTO(tagService.updateTag(id, request)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteTag(UUID id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
