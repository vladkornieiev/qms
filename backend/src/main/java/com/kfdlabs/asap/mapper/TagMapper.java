package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.entity.TagGroup;
import com.kfdlabs.asap.entity.TagGroupMember;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Mapper(componentModel = "spring")
public abstract class TagMapper {

    public TagGroupResponse toTagGroupDTO(TagGroup entity, List<TagGroupMember> members) {
        TagGroupResponse response = new TagGroupResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setColor(entity.getColor());
        response.setDescription(entity.getDescription());
        response.setCreatedAt(entity.getCreatedAt());
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

    public abstract TagResponse toTagDTO(Tag entity);

    public PaginatedTagGroupResponse toPaginatedTagGroupDTO(Page<TagGroup> page,
                                                             Function<UUID, List<TagGroupMember>> membersFetcher) {
        PaginatedTagGroupResponse response = new PaginatedTagGroupResponse();
        response.setItems(page.getContent().stream()
                .map(g -> toTagGroupDTO(g, membersFetcher.apply(g.getId())))
                .toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedTagResponse toPaginatedTagDTO(Page<Tag> page) {
        PaginatedTagResponse response = new PaginatedTagResponse();
        response.setItems(page.getContent().stream().map(this::toTagDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
