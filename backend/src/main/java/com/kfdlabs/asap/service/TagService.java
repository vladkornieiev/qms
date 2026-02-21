package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateTagGroupRequest;
import com.kfdlabs.asap.dto.CreateTagRequest;
import com.kfdlabs.asap.dto.UpdateTagGroupRequest;
import com.kfdlabs.asap.dto.UpdateTagRequest;
import com.kfdlabs.asap.entity.EntityTag;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.entity.TagGroup;
import com.kfdlabs.asap.repository.EntityTagRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.TagGroupRepository;
import com.kfdlabs.asap.repository.TagRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagGroupRepository tagGroupRepository;
    private final TagRepository tagRepository;
    private final EntityTagRepository entityTagRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    // Tag Groups
    public List<TagGroup> listTagGroups() {
        return tagGroupRepository.findByOrganizationId(SecurityUtils.getCurrentOrganizationId());
    }

    public TagGroup getTagGroup(UUID id) {
        TagGroup group = tagGroupRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Tag group not found"));
        if (!group.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return group;
    }

    public TagGroup createTagGroup(CreateTagGroupRequest request) {
        TagGroup group = new TagGroup();
        group.setOrganization(getCurrentOrg());
        group.setName(request.getName());
        group.setColor(request.getColor());
        group.setDescription(request.getDescription());
        return tagGroupRepository.save(group);
    }

    public TagGroup updateTagGroup(UUID id, UpdateTagGroupRequest request) {
        TagGroup group = getTagGroup(id);
        if (request.getName() != null) group.setName(request.getName().orElse(group.getName()));
        if (request.getColor() != null) group.setColor(request.getColor().orElse(group.getColor()));
        if (request.getDescription() != null) group.setDescription(request.getDescription().orElse(group.getDescription()));
        return tagGroupRepository.save(group);
    }

    public void deleteTagGroup(UUID id) {
        TagGroup group = getTagGroup(id);
        tagGroupRepository.delete(group);
    }

    // Tags
    public List<Tag> listTags(UUID groupId, String search) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        if (groupId != null) {
            return tagRepository.findByOrganizationIdAndTagGroupId(orgId, groupId);
        }
        if (search != null && !search.isEmpty()) {
            return tagRepository.findByOrganizationIdAndNameContainingIgnoreCase(orgId, search);
        }
        return tagRepository.findByOrganizationId(orgId);
    }

    public Tag getTag(UUID id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Tag not found"));
        if (!tag.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return tag;
    }

    public Tag createTag(CreateTagRequest request) {
        Tag tag = new Tag();
        tag.setOrganization(getCurrentOrg());
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        if (request.getTagGroupId() != null) {
            tag.setTagGroup(getTagGroup(request.getTagGroupId()));
        }
        return tagRepository.save(tag);
    }

    public Tag updateTag(UUID id, UpdateTagRequest request) {
        Tag tag = getTag(id);
        if (request.getName() != null) tag.setName(request.getName().orElse(tag.getName()));
        if (request.getColor() != null) tag.setColor(request.getColor().orElse(tag.getColor()));
        if (request.getTagGroupId() != null) {
            UUID groupId = request.getTagGroupId().orElse(null);
            tag.setTagGroup(groupId != null ? getTagGroup(groupId) : null);
        }
        return tagRepository.save(tag);
    }

    public void deleteTag(UUID id) {
        Tag tag = getTag(id);
        tagRepository.delete(tag);
    }

    // Entity Tags
    public List<Tag> getEntityTags(String entityType, UUID entityId) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        return entityTagRepository.findByOrganizationIdAndEntityTypeAndEntityId(orgId, entityType, entityId)
                .stream()
                .map(EntityTag::getTag)
                .toList();
    }

    public void applyTag(String entityType, UUID entityId, UUID tagId) {
        EntityTag entityTag = new EntityTag();
        entityTag.setOrganization(getCurrentOrg());
        entityTag.setTag(getTag(tagId));
        entityTag.setEntityType(entityType);
        entityTag.setEntityId(entityId);
        entityTagRepository.save(entityTag);
    }

    public void removeTag(String entityType, UUID entityId, UUID tagId) {
        entityTagRepository.deleteByTagIdAndEntityTypeAndEntityId(tagId, entityType, entityId);
    }
}
