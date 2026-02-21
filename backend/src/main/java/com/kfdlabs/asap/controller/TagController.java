package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.TagsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.TagMapper;
import com.kfdlabs.asap.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class TagController implements TagsApi {

    private final TagService tagService;
    private final TagMapper tagMapper;

    @Override
    public ResponseEntity<List<TagResponse>> listTags(UUID groupId, String search) {
        return ResponseEntity.ok(tagService.listTags(groupId, search).stream().map(tagMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<TagResponse> getTag(UUID id) {
        return ResponseEntity.ok(tagMapper.toDTO(tagService.getTag(id)));
    }

    @Override
    public ResponseEntity<TagResponse> createTag(CreateTagRequest request) {
        return ResponseEntity.status(201).body(tagMapper.toDTO(tagService.createTag(request)));
    }

    @Override
    public ResponseEntity<TagResponse> updateTag(UUID id, UpdateTagRequest request) {
        return ResponseEntity.ok(tagMapper.toDTO(tagService.updateTag(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteTag(UUID id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<TagResponse>> getEntityTags(String entityType, UUID entityId) {
        return ResponseEntity.ok(tagService.getEntityTags(entityType, entityId).stream().map(tagMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<Void> applyTagToEntity(String entityType, UUID entityId, ApplyTagRequest request) {
        tagService.applyTag(entityType, entityId, request.getTagId());
        return ResponseEntity.status(201).build();
    }

    @Override
    public ResponseEntity<Void> removeTagFromEntity(String entityType, UUID entityId, UUID tagId) {
        tagService.removeTag(entityType, entityId, tagId);
        return ResponseEntity.noContent().build();
    }
}
