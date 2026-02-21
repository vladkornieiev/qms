package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.LookupListsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.LookupListMapper;
import com.kfdlabs.asap.service.LookupListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class LookupListController implements LookupListsApi {

    private final LookupListService lookupListService;
    private final LookupListMapper lookupListMapper;

    @Override
    public ResponseEntity<List<LookupListResponse>> listLookupLists() {
        return ResponseEntity.ok(lookupListService.listLookupLists().stream()
                .map(lookupListMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<LookupListDetailResponse> getLookupList(UUID id) {
        var list = lookupListService.getLookupList(id);
        var items = lookupListService.getListItems(id);
        return ResponseEntity.ok(lookupListMapper.toDetailDTO(list, items));
    }

    @Override
    public ResponseEntity<LookupListResponse> createLookupList(CreateLookupListRequest request) {
        return ResponseEntity.status(201).body(lookupListMapper.toDTO(lookupListService.createLookupList(request)));
    }

    @Override
    public ResponseEntity<LookupListResponse> updateLookupList(UUID id, UpdateLookupListRequest request) {
        return ResponseEntity.ok(lookupListMapper.toDTO(lookupListService.updateLookupList(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteLookupList(UUID id) {
        lookupListService.deleteLookupList(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<LookupListItemResponse>> listLookupListItems(UUID id) {
        return ResponseEntity.ok(lookupListService.getListItems(id).stream()
                .map(lookupListMapper::toItemDTO).toList());
    }

    @Override
    public ResponseEntity<LookupListItemResponse> createLookupListItem(UUID id, CreateLookupListItemRequest request) {
        return ResponseEntity.status(201).body(lookupListMapper.toItemDTO(lookupListService.createItem(id, request)));
    }

    @Override
    public ResponseEntity<LookupListItemResponse> updateLookupListItem(UUID id, UUID itemId, UpdateLookupListItemRequest request) {
        return ResponseEntity.ok(lookupListMapper.toItemDTO(lookupListService.updateItem(id, itemId, request)));
    }

    @Override
    public ResponseEntity<Void> deleteLookupListItem(UUID id, UUID itemId) {
        lookupListService.deleteItem(id, itemId);
        return ResponseEntity.noContent().build();
    }
}
