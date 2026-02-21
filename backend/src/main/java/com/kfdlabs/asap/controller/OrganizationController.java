package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.OrganizationsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.OrganizationMapper;
import com.kfdlabs.asap.mapper.OrganizationMemberMapper;
import com.kfdlabs.asap.service.AuthService;
import com.kfdlabs.asap.service.OrganizationMemberService;
import com.kfdlabs.asap.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

import static com.kfdlabs.asap.security.SecurityUtils.getCurrentUserId;

@Slf4j
@Controller
@RequiredArgsConstructor
public class OrganizationController implements OrganizationsApi {

    private final OrganizationService organizationService;
    private final OrganizationMemberService organizationMemberService;
    private final AuthService authService;
    private final OrganizationMapper organizationMapper;
    private final OrganizationMemberMapper organizationMemberMapper;

    @Override
    public ResponseEntity<AuthResponse> switchOrganization(SwitchOrganizationRequest request) {
        return ResponseEntity.ok(authService.switchOrganization(request));
    }

    @Override
    public ResponseEntity<PaginatedAvailableOrganizationResponse> findAvailableOrganizations(
            String name, Integer page, Integer size, String sortBy, String order) {
        var orgs = organizationService.findAvailableOrganizationsForUser(
                getCurrentUserId(), name, page, size, sortBy, order);
        PaginatedAvailableOrganizationResponse response = new PaginatedAvailableOrganizationResponse();
        response.setItems(orgs.getContent().stream().map(org -> {
            AvailableOrganizationResponse item = new AvailableOrganizationResponse();
            item.setId(org.getId());
            item.setName(org.getName());
            return item;
        }).toList());
        response.setPage(orgs.getNumber());
        response.setSize(orgs.getSize());
        response.setTotalElements(orgs.getTotalElements());
        response.setTotalPages(orgs.getTotalPages());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Organization> createAdminOrganization(CreateOrganizationRequest request) {
        var org = organizationService.createOrganization(request);
        return ResponseEntity.ok(organizationMapper.toDTO(org));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<PaginatedOrganizationResponse> findAdminOrganizations(
            String query, Boolean isActive, Integer page, Integer size, String sortBy, String order) {
        var orgs = organizationService.findAllOrganizations(query, isActive, page, size, sortBy, order);
        return ResponseEntity.ok(organizationMapper.toPaginatedDTO(orgs));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Organization> getAdminOrganizationById(UUID id) {
        return ResponseEntity.ok(organizationMapper.toDTO(organizationService.getOrganizationById(id)));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Organization> updateAdminOrganization(UUID id, UpdateOrganizationRequest request) {
        return ResponseEntity.ok(organizationMapper.toDTO(organizationService.updateOrganization(id, request)));
    }

    @PreAuthorize("hasRole('ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteAdminOrganizationById(UUID id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<PaginatedOrganizationMemberResponse> listOrganizationMembers(
            UUID id, String query, UserRole role, Boolean isActive,
            Integer page, Integer size, String sortBy, String order) {
        var members = organizationMemberService.listMembers(
                id, query, role != null ? role.getValue() : null, isActive, page, size, sortBy, order);
        return ResponseEntity.ok(organizationMemberMapper.toPaginatedDTO(members));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<com.kfdlabs.asap.dto.OrganizationMember> addOrganizationMember(
            UUID id, AddOrganizationMemberRequest request) {
        var member = organizationMemberService.addMember(id, request);
        return ResponseEntity.status(201).body(organizationMemberMapper.toDTO(member));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<com.kfdlabs.asap.dto.OrganizationMember> updateOrganizationMember(
            UUID id, UUID memberId, UpdateOrganizationMemberRequest request) {
        var member = organizationMemberService.updateMember(id, memberId, request);
        return ResponseEntity.ok(organizationMemberMapper.toDTO(member));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN')")
    @Override
    public ResponseEntity<Void> removeOrganizationMember(UUID id, UUID memberId) {
        organizationMemberService.removeMember(id, memberId);
        return ResponseEntity.noContent().build();
    }
}
