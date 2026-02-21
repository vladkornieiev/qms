package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedProductResponse;
import com.kfdlabs.asap.dto.ProductResponse;
import com.kfdlabs.asap.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class ProductMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "categoryId", source = "category.id")
    public abstract ProductResponse toDTO(Product entity);

    public PaginatedProductResponse toPaginatedDTO(Page<Product> page) {
        PaginatedProductResponse response = new PaginatedProductResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
