package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.TagGroupResponse;
import com.kfdlabs.asap.entity.TagGroup;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public abstract class TagGroupMapper {
    public abstract TagGroupResponse toDTO(TagGroup entity);
}
