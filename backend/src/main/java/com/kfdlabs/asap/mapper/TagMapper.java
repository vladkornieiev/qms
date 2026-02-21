package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.TagResponse;
import com.kfdlabs.asap.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class TagMapper {

    @Mapping(target = "tagGroupId", source = "tagGroup.id")
    @Mapping(target = "tagGroupName", source = "tagGroup.name")
    public abstract TagResponse toDTO(Tag entity);
}
