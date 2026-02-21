package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.InventoryItem;
import com.kfdlabs.asap.entity.InventoryTransaction;
import com.kfdlabs.asap.entity.StockLevel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class InventoryMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "vendorId", source = "vendor.id")
    public abstract InventoryItemResponse toItemDTO(InventoryItem entity);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    public abstract StockLevelResponse toStockLevelDTO(StockLevel entity);

    @Mapping(target = "inventoryItemId", source = "inventoryItem.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "stockLevelId", source = "stockLevel.id")
    @Mapping(target = "performedById", source = "performedBy.id")
    public abstract InventoryTransactionResponse toTransactionDTO(InventoryTransaction entity);

    public PaginatedInventoryItemResponse toPaginatedItemDTO(Page<InventoryItem> page) {
        PaginatedInventoryItemResponse response = new PaginatedInventoryItemResponse();
        response.setItems(page.getContent().stream().map(this::toItemDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedInventoryTransactionResponse toPaginatedTransactionDTO(Page<InventoryTransaction> page) {
        PaginatedInventoryTransactionResponse response = new PaginatedInventoryTransactionResponse();
        response.setItems(page.getContent().stream().map(this::toTransactionDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
