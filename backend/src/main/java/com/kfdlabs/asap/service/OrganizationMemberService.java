package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.AddOrganizationMemberRequest;
import com.kfdlabs.asap.dto.UpdateOrganizationMemberRequest;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.OrganizationMember;
import com.kfdlabs.asap.entity.User;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationMemberService {

    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationMember addMember(UUID organizationId, AddOrganizationMemberRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.organization.not.found"));

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.user.not.found"));

        organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, user.getId())
                .ifPresent(existing -> {
                    throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.member.already.exists");
                });

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(org);
        member.setUser(user);
        member.setRole(request.getRole().getValue().toLowerCase());
        member.setInvitedAt(LocalDateTime.now());
        member.setJoinedAt(LocalDateTime.now());
        member.setIsActive(true);

        return organizationMemberRepository.save(member);
    }

    public OrganizationMember updateMember(UUID organizationId, UUID memberId, UpdateOrganizationMemberRequest request) {
        OrganizationMember member = organizationMemberRepository.findById(memberId)
                .filter(m -> m.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.member.not.found"));

        if (request.getRole() != null) {
            member.setRole(request.getRole().getValue().toLowerCase());
        }
        if (request.getIsActive() != null) {
            member.setIsActive(request.getIsActive());
        }

        return organizationMemberRepository.save(member);
    }

    public void removeMember(UUID organizationId, UUID memberId) {
        OrganizationMember member = organizationMemberRepository.findById(memberId)
                .filter(m -> m.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.member.not.found"));

        organizationMemberRepository.delete(member);
    }

    public Page<OrganizationMember> listMembers(UUID organizationId, String query, String role, Boolean isActive,
                                                 Integer page, Integer size, String sortBy, String order) {
        return organizationMemberRepository.findByOrganizationId(organizationId,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }
}
