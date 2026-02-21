package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.TagGroupsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.TagGroupMapper;
import com.kfdlabs.asap.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class TagGroupController implements TagGroupsApi {

    private final TagService tagService;
    private final TagGroupMapper tagGroupMapper;

    @Override
    public ResponseEntity<List<TagGroupResponse>> listTagGroups() {
        return ResponseEntity.ok(tagService.listTagGroups().stream().map(tagGroupMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<TagGroupResponse> getTagGroup(UUID id) {
        return ResponseEntity.ok(tagGroupMapper.toDTO(tagService.getTagGroup(id)));
    }

    @Override
    public ResponseEntity<TagGroupResponse> createTagGroup(CreateTagGroupRequest request) {
        return ResponseEntity.status(201).body(tagGroupMapper.toDTO(tagService.createTagGroup(request)));
    }

    @Override
    public ResponseEntity<TagGroupResponse> updateTagGroup(UUID id, UpdateTagGroupRequest request) {
        return ResponseEntity.ok(tagGroupMapper.toDTO(tagService.updateTagGroup(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteTagGroup(UUID id) {
        tagService.deleteTagGroup(id);
        return ResponseEntity.noContent().build();
    }
}
