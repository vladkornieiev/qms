package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.EntityTag;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.repository.EntityTagRepository;
import com.kfdlabs.asap.repository.TagRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EntityTagService {

    private final EntityTagRepository entityTagRepository;
    private final TagRepository tagRepository;

    public List<EntityTag> setEntityTags(String entityType, UUID entityId, List<UUID> tagIds) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        List<EntityTag> existing = entityTagRepository.findByEntityTypeAndEntityId(entityType, entityId);
        Set<UUID> existingTagIds = existing.stream()
                .map(et -> et.getTag().getId())
                .collect(Collectors.toSet());
        Set<UUID> desiredTagIds = tagIds != null ? new LinkedHashSet<>(tagIds) : Set.of();

        // Remove tags no longer in the desired list
        existing.stream()
                .filter(et -> !desiredTagIds.contains(et.getTag().getId()))
                .forEach(entityTagRepository::delete);

        // Add new tags
        List<EntityTag> result = new ArrayList<>(existing.stream()
                .filter(et -> desiredTagIds.contains(et.getTag().getId()))
                .toList());

        for (UUID tagId : desiredTagIds) {
            if (!existingTagIds.contains(tagId)) {
                Tag tag = tagRepository.findById(tagId).orElse(null);
                if (tag == null) continue;
                EntityTag et = new EntityTag();
                et.setOrganizationId(orgId);
                et.setTag(tag);
                et.setEntityType(entityType);
                et.setEntityId(entityId);
                result.add(entityTagRepository.save(et));
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Tag> getDistinctTagsInUse(String entityType) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        if (entityType != null && !entityType.isBlank()) {
            return entityTagRepository.findDistinctTagsByEntityType(entityType, orgId);
        }
        return entityTagRepository.findDistinctTagsInUse(orgId);
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<Tag>> getEntityTagsBatch(String entityType, List<UUID> entityIds) {
        if (entityIds.isEmpty()) return Map.of();
        List<EntityTag> allTags = entityTagRepository.findByEntityTypeAndEntityIdIn(entityType, entityIds);
        return allTags.stream().collect(Collectors.groupingBy(
                EntityTag::getEntityId,
                Collectors.mapping(EntityTag::getTag, Collectors.toList())
        ));
    }
}
