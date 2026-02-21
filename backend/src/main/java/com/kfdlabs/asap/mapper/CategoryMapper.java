package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.CategoryResponse;
import com.kfdlabs.asap.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class CategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "children", ignore = true)
    public abstract CategoryResponse toDTO(Category entity);

    public CategoryResponse toDTOWithChildren(Category entity, List<CategoryResponse> children) {
        CategoryResponse dto = toDTO(entity);
        dto.setChildren(children);
        return dto;
    }
}
