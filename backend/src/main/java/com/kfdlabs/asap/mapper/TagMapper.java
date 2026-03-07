package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedTagGroupResponse;
import com.kfdlabs.asap.dto.PaginatedTagResponse;
import com.kfdlabs.asap.dto.TagGroupResponse;
import com.kfdlabs.asap.dto.TagResponse;
import com.kfdlabs.asap.entity.Tag;
import com.kfdlabs.asap.entity.TagGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class TagMapper {

    public abstract TagGroupResponse toTagGroupDTO(TagGroup entity);

    @Mapping(source = "tagGroup.id", target = "tagGroupId")
    @Mapping(source = "tagGroup.name", target = "tagGroupName")
    public abstract TagResponse toTagDTO(Tag entity);

    public PaginatedTagGroupResponse toPaginatedTagGroupDTO(Page<TagGroup> page) {
        PaginatedTagGroupResponse response = new PaginatedTagGroupResponse();
        response.setItems(page.getContent().stream().map(this::toTagGroupDTO).toList());
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
