package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.InventoryApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.InventoryMapper;
import com.kfdlabs.asap.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class InventoryController implements InventoryApi {

    private final InventoryService inventoryService;
    private final InventoryMapper inventoryMapper;

    @Override
    public ResponseEntity<PaginatedInventoryItemResponse> listInventoryItems(
            String query, String status, UUID productId,
            Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(inventoryMapper.toPaginatedItemDTO(
                inventoryService.listItems(query, status, productId, page, size, sortBy, order)));
    }

    @Override
    public ResponseEntity<InventoryItemResponse> getInventoryItemById(UUID id) {
        return ResponseEntity.ok(inventoryMapper.toItemDTO(inventoryService.getItem(id)));
    }

    @Override
    public ResponseEntity<InventoryItemResponse> createInventoryItem(CreateInventoryItemRequest createInventoryItemRequest) {
        return ResponseEntity.status(201).body(inventoryMapper.toItemDTO(
                inventoryService.createItem(createInventoryItemRequest)));
    }

    @Override
    public ResponseEntity<InventoryItemResponse> updateInventoryItem(UUID id, UpdateInventoryItemRequest updateInventoryItemRequest) {
        return ResponseEntity.ok(inventoryMapper.toItemDTO(inventoryService.updateItem(id, updateInventoryItemRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteInventoryItem(UUID id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<InventoryItemResponse> checkOutInventoryItem(UUID id, CheckOutRequest checkOutRequest) {
        return ResponseEntity.ok(inventoryMapper.toItemDTO(inventoryService.checkOut(id, checkOutRequest)));
    }

    @Override
    public ResponseEntity<InventoryItemResponse> checkInInventoryItem(UUID id, CheckInRequest checkInRequest) {
        return ResponseEntity.ok(inventoryMapper.toItemDTO(inventoryService.checkIn(id, checkInRequest)));
    }

    @Override
    public ResponseEntity<InventoryItemResponse> transferInventoryItem(UUID id, TransferItemRequest transferItemRequest) {
        return ResponseEntity.ok(inventoryMapper.toItemDTO(inventoryService.transferItem(id, transferItemRequest)));
    }

    @Override
    public ResponseEntity<StockLevelResponse> consumeStock(UUID id, ConsumeStockRequest consumeStockRequest) {
        return ResponseEntity.ok(inventoryMapper.toStockLevelDTO(inventoryService.consumeStock(id, consumeStockRequest)));
    }

    @Override
    public ResponseEntity<StockLevelResponse> restockLevel(UUID id, RestockRequest restockRequest) {
        return ResponseEntity.ok(inventoryMapper.toStockLevelDTO(inventoryService.restockLevel(id, restockRequest)));
    }

    @Override
    public ResponseEntity<StockLevelResponse> transferStock(UUID id, TransferStockRequest transferStockRequest) {
        return ResponseEntity.ok(inventoryMapper.toStockLevelDTO(inventoryService.transferStock(id, transferStockRequest)));
    }

    @Override
    public ResponseEntity<PaginatedInventoryTransactionResponse> listInventoryTransactions(
            UUID inventoryItemId, UUID productId, UUID projectId,
            Integer page, Integer size) {
        return ResponseEntity.ok(inventoryMapper.toPaginatedTransactionDTO(
                inventoryService.listTransactions(inventoryItemId, productId, projectId, page, size)));
    }
}
