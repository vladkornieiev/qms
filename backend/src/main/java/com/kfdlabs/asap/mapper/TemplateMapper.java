package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Template;
import com.kfdlabs.asap.entity.TemplateItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class TemplateMapper {

    @Mapping(target = "createdById", source = "createdBy.id")
    public abstract TemplateResponse toDTO(Template entity);

    @Mapping(target = "templateId", source = "template.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "dependsOnItemId", source = "dependsOnItem.id")
    public abstract TemplateItemResponse toItemDTO(TemplateItem entity);

    public TemplateDetailResponse toDetailDTO(Template entity, List<TemplateItem> items) {
        TemplateDetailResponse response = new TemplateDetailResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setTemplateType(entity.getTemplateType());
        response.setIsClientFacing(entity.getIsClientFacing());
        response.setIsActive(entity.getIsActive());
        response.setSettings(entity.getSettings());
        response.setCreatedById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null);
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setItems(items.stream().map(this::toItemDTO).toList());
        return response;
    }

    public PaginatedTemplateResponse toPaginatedDTO(Page<Template> page) {
        PaginatedTemplateResponse response = new PaginatedTemplateResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
