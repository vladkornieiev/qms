package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.VendorsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.VendorMapper;
import com.kfdlabs.asap.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class VendorController implements VendorsApi {

    private final VendorService vendorService;
    private final VendorMapper vendorMapper;

    @Override
    public ResponseEntity<PaginatedVendorResponse> listVendors(
            String query, String type, Boolean isActive,
            Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(vendorMapper.toPaginatedDTO(
                vendorService.listVendors(query, type, isActive, page, size, sortBy, order)));
    }

    @Override
    public ResponseEntity<VendorResponse> getVendorById(UUID id) {
        return ResponseEntity.ok(vendorMapper.toDTO(vendorService.getVendor(id)));
    }

    @Override
    public ResponseEntity<VendorResponse> createVendor(CreateVendorRequest request) {
        return ResponseEntity.status(201).body(vendorMapper.toDTO(vendorService.createVendor(request)));
    }

    @Override
    public ResponseEntity<VendorResponse> updateVendor(UUID id, UpdateVendorRequest request) {
        return ResponseEntity.ok(vendorMapper.toDTO(vendorService.updateVendor(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteVendor(UUID id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<VendorContactResponse>> listVendorContacts(UUID id) {
        return ResponseEntity.ok(vendorService.listContacts(id).stream()
                .map(vendorMapper::toContactDTO).toList());
    }

    @Override
    public ResponseEntity<VendorContactResponse> createVendorContact(UUID id, CreateVendorContactRequest request) {
        return ResponseEntity.status(201).body(vendorMapper.toContactDTO(
                vendorService.createContact(id, request)));
    }

    @Override
    public ResponseEntity<VendorContactResponse> updateVendorContact(UUID id, UUID contactId, UpdateVendorContactRequest request) {
        return ResponseEntity.ok(vendorMapper.toContactDTO(
                vendorService.updateContact(id, contactId, request)));
    }

    @Override
    public ResponseEntity<Void> deleteVendorContact(UUID id, UUID contactId) {
        vendorService.deleteContact(id, contactId);
        return ResponseEntity.noContent().build();
    }
}
