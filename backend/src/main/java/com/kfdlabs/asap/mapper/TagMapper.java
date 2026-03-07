package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.entity.TagGroup;
import com.kfdlabs.asap.entity.TagGroupMember;
import com.kfdlabs.asap.service.TagService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper(componentModel = "spring")
public abstract class TagMapper {

    @Autowired
    protected TagService tagService;

    public TagGroupResponse toTagGroupDTO(TagGroup entity) {
        List<TagGroupMember> members = tagService.getTagGroupMembers(entity.getId());
        Map<UUID, Long> refCounts = tagService.getTagGroupReferenceCounts(List.of(entity.getId()));
        TagGroupResponse response = new TagGroupResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setColor(entity.getColor());
        response.setDescription(entity.getDescription());
        response.setCreatedAt(entity.getCreatedAt());
        response.setReferenceCount(refCounts.getOrDefault(entity.getId(), 0L));
        response.setTags(members.stream()
                .map(m -> {
                    TagSummary summary = new TagSummary();
                    summary.setId(m.getTag().getId());
                    summary.setName(m.getTag().getName());
                    summary.setColor(m.getTag().getColor());
                    return summary;
                })
                .toList());
        return response;
    }

    @Mapping(target = "referenceCount", ignore = true)
    public abstract TagResponse toTagDTO(Tag entity);

    public PaginatedTagGroupResponse toPaginatedTagGroupDTO(Page<TagGroup> page) {
        List<UUID> groupIds = page.getContent().stream().map(TagGroup::getId).toList();
        Map<UUID, Long> refCounts = tagService.getTagGroupReferenceCounts(groupIds);
        PaginatedTagGroupResponse response = new PaginatedTagGroupResponse();
        response.setItems(page.getContent().stream()
                .map(g -> {
                    List<TagGroupMember> members = tagService.getTagGroupMembers(g.getId());
                    TagGroupResponse dto = new TagGroupResponse();
                    dto.setId(g.getId());
                    dto.setName(g.getName());
                    dto.setColor(g.getColor());
                    dto.setDescription(g.getDescription());
                    dto.setCreatedAt(g.getCreatedAt());
                    dto.setReferenceCount(refCounts.getOrDefault(g.getId(), 0L));
                    dto.setTags(members.stream()
                            .map(m -> {
                                TagSummary summary = new TagSummary();
                                summary.setId(m.getTag().getId());
                                summary.setName(m.getTag().getName());
                                summary.setColor(m.getTag().getColor());
                                return summary;
                            })
                            .toList());
                    return dto;
                })
                .toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedTagResponse toPaginatedTagDTO(Page<Tag> page) {
        List<UUID> tagIds = page.getContent().stream().map(Tag::getId).toList();
        Map<UUID, Long> refCounts = tagService.getTagReferenceCounts(tagIds);
        PaginatedTagResponse response = new PaginatedTagResponse();
        response.setItems(page.getContent().stream().map(t -> {
            TagResponse dto = toTagDTO(t);
            dto.setReferenceCount(refCounts.getOrDefault(t.getId(), 0L));
            return dto;
        }).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
