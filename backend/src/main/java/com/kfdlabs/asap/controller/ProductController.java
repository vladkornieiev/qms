package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ProductsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.InventoryMapper;
import com.kfdlabs.asap.mapper.ProductMapper;
import com.kfdlabs.asap.service.InventoryService;
import com.kfdlabs.asap.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ProductController implements ProductsApi {

    private final ProductService productService;
    private final InventoryService inventoryService;
    private final ProductMapper productMapper;
    private final InventoryMapper inventoryMapper;

    @Override
    public ResponseEntity<PaginatedProductResponse> listProducts(
            String query, String productType, String trackingType, Boolean isActive,
            Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(productMapper.toPaginatedDTO(
                productService.listProducts(query, productType, trackingType, isActive, page, size, sortBy, order)));
    }

    @Override
    public ResponseEntity<ProductResponse> getProductById(UUID id) {
        return ResponseEntity.ok(productMapper.toDTO(productService.getProduct(id)));
    }

    @Override
    public ResponseEntity<ProductResponse> createProduct(CreateProductRequest createProductRequest) {
        return ResponseEntity.status(201).body(productMapper.toDTO(productService.createProduct(createProductRequest)));
    }

    @Override
    public ResponseEntity<ProductResponse> updateProduct(UUID id, UpdateProductRequest updateProductRequest) {
        return ResponseEntity.ok(productMapper.toDTO(productService.updateProduct(id, updateProductRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteProduct(UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<ProductResponse>> listProductChildren(UUID id) {
        return ResponseEntity.ok(productService.listChildren(id).stream()
                .map(productMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<List<InventoryItemResponse>> listProductInventory(UUID id) {
        return ResponseEntity.ok(inventoryService.listItemsByProduct(id).stream()
                .map(inventoryMapper::toItemDTO).toList());
    }

    @Override
    public ResponseEntity<List<StockLevelResponse>> listProductStock(UUID id) {
        return ResponseEntity.ok(inventoryService.listStockByProduct(id).stream()
                .map(inventoryMapper::toStockLevelDTO).toList());
    }
}
