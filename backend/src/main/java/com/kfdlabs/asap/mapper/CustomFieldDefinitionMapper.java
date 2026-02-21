package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.CustomFieldDefinitionResponse;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class CustomFieldDefinitionMapper {

    @Mapping(target = "lookupListId", source = "lookupList.id")
    @Mapping(target = "dependsOnFieldId", source = "dependsOnField.id")
    public abstract CustomFieldDefinitionResponse toDTO(CustomFieldDefinition entity);
}
