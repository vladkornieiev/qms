package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateTagGroupRequest;
import com.kfdlabs.asap.dto.CreateTagRequest;
import com.kfdlabs.asap.dto.UpdateTagGroupRequest;
import com.kfdlabs.asap.dto.UpdateTagRequest;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.entity.TagGroup;
import com.kfdlabs.asap.entity.TagGroupMember;
import com.kfdlabs.asap.repository.TagGroupMemberRepository;
import com.kfdlabs.asap.repository.TagGroupRepository;
import com.kfdlabs.asap.repository.TagRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.openapitools.jackson.nullable.JsonNullable.undefined;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagGroupRepository tagGroupRepository;
    private final TagRepository tagRepository;
    private final TagGroupMemberRepository tagGroupMemberRepository;

    // ---- Tag Groups ----

    public TagGroup createTagGroup(CreateTagGroupRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        tagGroupRepository.findByOrganizationIdAndName(orgId, request.getName())
                .ifPresent(existing -> {
                    throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.tag_group.name.conflict");
                });

        TagGroup group = new TagGroup();
        group.setOrganizationId(orgId);
        group.setName(request.getName());
        group.setColor(request.getColor());
        group.setDescription(request.getDescription());
        group = tagGroupRepository.save(group);

        if (request.getTagIds() != null) {
            syncMembers(group, request.getTagIds(), orgId);
        }
        return group;
    }

    @Transactional(readOnly = true)
    public TagGroup getTagGroupById(UUID id) {
        return tagGroupRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.tag_group.not.found"));
    }

    public List<TagGroupMember> getTagGroupMembers(UUID groupId) {
        return tagGroupMemberRepository.findByTagGroupIdOrderByDisplayOrder(groupId);
    }

    public TagGroup updateTagGroup(UUID id, UpdateTagGroupRequest request) {
        TagGroup group = getTagGroupById(id);
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        if (request.getName() != null && !request.getName().equals(undefined())) {
            String name = request.getName().orElse("");
            tagGroupRepository.findByOrganizationIdAndName(orgId, name)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.tag_group.name.conflict");
                    });
            group.setName(name);
        }
        if (request.getColor() != null && !request.getColor().equals(undefined())) {
            group.setColor(request.getColor().orElse(null));
        }
        if (request.getDescription() != null && !request.getDescription().equals(undefined())) {
            group.setDescription(request.getDescription().orElse(null));
        }
        if (request.getTagIds() != null && !request.getTagIds().equals(undefined())) {
            List<UUID> newTagIds = request.getTagIds().orElse(List.of());
            syncMembers(group, newTagIds, orgId);
        }
        return tagGroupRepository.save(group);
    }

    public void deleteTagGroup(UUID id) {
        if (!tagGroupRepository.existsById(id)) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.tag_group.not.found");
        }
        tagGroupRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<TagGroup> findAllTagGroups(String query, Integer page, Integer size, String sortBy, String order) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return tagGroupRepository.findAll(orgId, query == null ? "" : query,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }

    // ---- Tags ----

    public Tag createTag(CreateTagRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        tagRepository.findByOrganizationIdAndName(orgId, request.getName())
                .ifPresent(existing -> {
                    throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.tag.name.conflict");
                });

        Tag tag = new Tag();
        tag.setOrganizationId(orgId);
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        return tagRepository.save(tag);
    }

    @Transactional(readOnly = true)
    public Tag getTagById(UUID id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.tag.not.found"));
    }

    public Tag updateTag(UUID id, UpdateTagRequest request) {
        Tag tag = getTagById(id);
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        if (request.getName() != null && !request.getName().equals(undefined())) {
            String name = request.getName().orElse("");
            tagRepository.findByOrganizationIdAndName(orgId, name)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.tag.name.conflict");
                    });
            tag.setName(name);
        }
        if (request.getColor() != null && !request.getColor().equals(undefined())) {
            tag.setColor(request.getColor().orElse(null));
        }
        return tagRepository.save(tag);
    }

    public void deleteTag(UUID id) {
        if (!tagRepository.existsById(id)) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.tag.not.found");
        }
        tagRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<Tag> findAllTags(String query, Integer page, Integer size, String sortBy, String order) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return tagRepository.findAll(orgId, query == null ? "" : query,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }

    private void syncMembers(TagGroup group, List<UUID> desiredTagIds, UUID orgId) {
        List<TagGroupMember> existing = tagGroupMemberRepository.findByTagGroupIdOrderByDisplayOrder(group.getId());
        Set<UUID> existingTagIds = existing.stream()
                .map(m -> m.getTag().getId())
                .collect(Collectors.toSet());
        Set<UUID> desiredSet = new LinkedHashSet<>(desiredTagIds);

        // Remove members no longer in the list
        existing.stream()
                .filter(m -> !desiredSet.contains(m.getTag().getId()))
                .forEach(tagGroupMemberRepository::delete);

        // Add new members and update display order
        for (int i = 0; i < desiredTagIds.size(); i++) {
            UUID tagId = desiredTagIds.get(i);
            int displayOrder = i;
            if (!existingTagIds.contains(tagId)) {
                Tag tag = getTagById(tagId);
                TagGroupMember member = new TagGroupMember();
                member.setOrganizationId(orgId);
                member.setTagGroup(group);
                member.setTag(tag);
                member.setDisplayOrder(displayOrder);
                tagGroupMemberRepository.save(member);
            } else {
                existing.stream()
                        .filter(m -> m.getTag().getId().equals(tagId))
                        .findFirst()
                        .ifPresent(m -> {
                            m.setDisplayOrder(displayOrder);
                            tagGroupMemberRepository.save(m);
                        });
            }
        }
    }
}
