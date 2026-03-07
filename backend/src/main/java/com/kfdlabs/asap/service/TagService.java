package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateTagGroupRequest;
import com.kfdlabs.asap.dto.CreateTagRequest;
import com.kfdlabs.asap.dto.UpdateTagGroupRequest;
import com.kfdlabs.asap.dto.UpdateTagRequest;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.entity.TagGroup;
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

import java.util.UUID;

import static org.openapitools.jackson.nullable.JsonNullable.undefined;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagGroupRepository tagGroupRepository;
    private final TagRepository tagRepository;

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
        return tagGroupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public TagGroup getTagGroupById(UUID id) {
        return tagGroupRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.tag_group.not.found"));
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
        UUID groupId = request.getTagGroupId();

        tagRepository.findByOrgAndNameAndGroup(orgId, request.getName(), groupId)
                .ifPresent(existing -> {
                    throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.tag.name.conflict");
                });

        Tag tag = new Tag();
        tag.setOrganizationId(orgId);
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        if (groupId != null) {
            tag.setTagGroup(getTagGroupById(groupId));
        }
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
            UUID groupId = tag.getTagGroup() != null ? tag.getTagGroup().getId() : null;
            tagRepository.findByOrgAndNameAndGroup(orgId, name, groupId)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.tag.name.conflict");
                    });
            tag.setName(name);
        }
        if (request.getColor() != null && !request.getColor().equals(undefined())) {
            tag.setColor(request.getColor().orElse(null));
        }
        if (request.getTagGroupId() != null && !request.getTagGroupId().equals(undefined())) {
            UUID groupId = request.getTagGroupId().orElse(null);
            tag.setTagGroup(groupId != null ? getTagGroupById(groupId) : null);
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
    public Page<Tag> findAllTags(String query, UUID tagGroupId, Integer page, Integer size, String sortBy, String order) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return tagRepository.findAll(orgId, query == null ? "" : query, tagGroupId,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }
}
