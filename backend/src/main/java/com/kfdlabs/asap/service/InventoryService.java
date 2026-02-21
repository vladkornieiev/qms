package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.InventoryItem;
import com.kfdlabs.asap.entity.InventoryTransaction;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Product;
import com.kfdlabs.asap.entity.StockLevel;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final StockLevelRepository stockLevelRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    // ===== Inventory Items (serialized) =====

    public Page<InventoryItem> listItems(String query, String status, UUID productId,
                                          Integer page, Integer size, String sortBy, String order) {
        return inventoryItemRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, status, productId, PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public InventoryItem getItem(UUID id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Inventory item not found"));
        if (!item.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return item;
    }

    public List<InventoryItem> listItemsByProduct(UUID productId) {
        return inventoryItemRepository.findByOrganizationIdAndProductId(SecurityUtils.getCurrentOrganizationId(), productId);
    }

    public InventoryItem createItem(CreateInventoryItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Product not found"));
        InventoryItem item = new InventoryItem();
        item.setOrganization(getCurrentOrg());
        item.setProduct(product);
        if (request.getVendorId() != null) {
            item.setVendor(vendorRepository.findById(request.getVendorId()).orElse(null));
        }
        if (request.getSerialNumber() != null) item.setSerialNumber(request.getSerialNumber());
        if (request.getBarcode() != null) item.setBarcode(request.getBarcode());
        if (request.getStatus() != null) item.setStatus(request.getStatus());
        if (request.getCondition() != null) item.setCondition(request.getCondition());
        if (request.getOwnership() != null) item.setOwnership(request.getOwnership());
        if (request.getLocation() != null) item.setLocation(request.getLocation());
        if (request.getNotes() != null) item.setNotes(request.getNotes());
        if (request.getPurchasePrice() != null) item.setPurchasePrice(request.getPurchasePrice());
        if (request.getPurchaseDate() != null) item.setPurchaseDate(request.getPurchaseDate());
        if (request.getCustomFields() != null) item.setCustomFields(request.getCustomFields());
        return inventoryItemRepository.save(item);
    }

    public InventoryItem updateItem(UUID id, UpdateInventoryItemRequest request) {
        InventoryItem item = getItem(id);
        if (request.getSerialNumber() != null) item.setSerialNumber(request.getSerialNumber().orElse(item.getSerialNumber()));
        if (request.getBarcode() != null) item.setBarcode(request.getBarcode().orElse(item.getBarcode()));
        if (request.getStatus() != null) item.setStatus(request.getStatus().orElse(item.getStatus()));
        if (request.getCondition() != null) item.setCondition(request.getCondition().orElse(item.getCondition()));
        if (request.getOwnership() != null) item.setOwnership(request.getOwnership().orElse(item.getOwnership()));
        if (request.getLocation() != null) item.setLocation(request.getLocation().orElse(item.getLocation()));
        if (request.getNotes() != null) item.setNotes(request.getNotes().orElse(item.getNotes()));
        if (request.getPurchasePrice() != null) item.setPurchasePrice(request.getPurchasePrice().orElse(item.getPurchasePrice()));
        if (request.getPurchaseDate() != null) item.setPurchaseDate(request.getPurchaseDate().orElse(item.getPurchaseDate()));
        if (request.getVendorId() != null) {
            UUID vendorId = request.getVendorId().orElse(null);
            item.setVendor(vendorId != null ? vendorRepository.findById(vendorId).orElse(null) : null);
        }
        if (request.getCustomFields() != null) {
            item.setCustomFields(request.getCustomFields().orElse(item.getCustomFields()));
        }
        return inventoryItemRepository.save(item);
    }

    public void deleteItem(UUID id) {
        InventoryItem item = getItem(id);
        inventoryItemRepository.delete(item);
    }

    public InventoryItem checkOut(UUID id, CheckOutRequest request) {
        InventoryItem item = getItem(id);
        if (!"available".equals(item.getStatus())) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "Item is not available for check-out");
        }
        item.setStatus("checked_out");
        inventoryItemRepository.save(item);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setOrganization(item.getOrganization());
        tx.setInventoryItem(item);
        tx.setTransactionType("check_out");
        if (request.getProjectId() != null) tx.setProjectId(request.getProjectId());
        if (request.getNotes() != null) tx.setNotes(request.getNotes());
        tx.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(tx);

        return item;
    }

    public InventoryItem checkIn(UUID id, CheckInRequest request) {
        InventoryItem item = getItem(id);
        item.setStatus("available");
        if (request.getCondition() != null) item.setCondition(request.getCondition());
        if (request.getLocation() != null) item.setLocation(request.getLocation());
        inventoryItemRepository.save(item);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setOrganization(item.getOrganization());
        tx.setInventoryItem(item);
        tx.setTransactionType("check_in");
        if (request.getNotes() != null) tx.setNotes(request.getNotes());
        tx.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(tx);

        return item;
    }

    public InventoryItem transferItem(UUID id, TransferItemRequest request) {
        InventoryItem item = getItem(id);
        item.setLocation(request.getLocation());
        inventoryItemRepository.save(item);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setOrganization(item.getOrganization());
        tx.setInventoryItem(item);
        tx.setTransactionType("transfer");
        if (request.getNotes() != null) tx.setNotes(request.getNotes());
        tx.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(tx);

        return item;
    }

    // ===== Stock Levels (consumable) =====

    public List<StockLevel> listStockByProduct(UUID productId) {
        return stockLevelRepository.findByOrganizationIdAndProductId(SecurityUtils.getCurrentOrganizationId(), productId);
    }

    private StockLevel getStockLevel(UUID id) {
        StockLevel sl = stockLevelRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Stock level not found"));
        if (!sl.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return sl;
    }

    public StockLevel consumeStock(UUID stockLevelId, ConsumeStockRequest request) {
        StockLevel sl = getStockLevel(stockLevelId);
        BigDecimal qty = request.getQuantity();
        if (sl.getQuantityOnHand().compareTo(qty) < 0) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }
        sl.setQuantityOnHand(sl.getQuantityOnHand().subtract(qty));
        stockLevelRepository.save(sl);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setOrganization(sl.getOrganization());
        tx.setProduct(sl.getProduct());
        tx.setStockLevel(sl);
        tx.setQuantity(qty);
        tx.setTransactionType("consume");
        if (request.getProjectId() != null) tx.setProjectId(request.getProjectId());
        if (request.getNotes() != null) tx.setNotes(request.getNotes());
        tx.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(tx);

        return sl;
    }

    public StockLevel restockLevel(UUID stockLevelId, RestockRequest request) {
        StockLevel sl = getStockLevel(stockLevelId);
        sl.setQuantityOnHand(sl.getQuantityOnHand().add(request.getQuantity()));
        stockLevelRepository.save(sl);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setOrganization(sl.getOrganization());
        tx.setProduct(sl.getProduct());
        tx.setStockLevel(sl);
        tx.setQuantity(request.getQuantity());
        tx.setTransactionType("restock");
        if (request.getNotes() != null) tx.setNotes(request.getNotes());
        tx.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(tx);

        return sl;
    }

    public StockLevel transferStock(UUID stockLevelId, TransferStockRequest request) {
        StockLevel source = getStockLevel(stockLevelId);
        BigDecimal qty = request.getQuantity();
        if (source.getQuantityOnHand().compareTo(qty) < 0) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Insufficient stock for transfer");
        }
        source.setQuantityOnHand(source.getQuantityOnHand().subtract(qty));
        stockLevelRepository.save(source);

        // Find or create destination stock level
        StockLevel dest = stockLevelRepository.findByProductIdAndLocation(source.getProduct().getId(), request.getToLocation())
                .orElseGet(() -> {
                    StockLevel newSl = new StockLevel();
                    newSl.setOrganization(source.getOrganization());
                    newSl.setProduct(source.getProduct());
                    newSl.setLocation(request.getToLocation());
                    return newSl;
                });
        dest.setQuantityOnHand(dest.getQuantityOnHand().add(qty));
        stockLevelRepository.save(dest);

        // Record transfer_out
        InventoryTransaction txOut = new InventoryTransaction();
        txOut.setOrganization(source.getOrganization());
        txOut.setProduct(source.getProduct());
        txOut.setStockLevel(source);
        txOut.setQuantity(qty);
        txOut.setTransactionType("transfer_out");
        if (request.getNotes() != null) txOut.setNotes(request.getNotes());
        txOut.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(txOut);

        // Record transfer_in
        InventoryTransaction txIn = new InventoryTransaction();
        txIn.setOrganization(dest.getOrganization());
        txIn.setProduct(dest.getProduct());
        txIn.setStockLevel(dest);
        txIn.setQuantity(qty);
        txIn.setTransactionType("transfer_in");
        if (request.getNotes() != null) txIn.setNotes(request.getNotes());
        txIn.setPerformedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        transactionRepository.save(txIn);

        return source;
    }

    // ===== Transactions =====

    public Page<InventoryTransaction> listTransactions(UUID inventoryItemId, UUID productId, UUID projectId,
                                                        Integer page, Integer size) {
        return transactionRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                inventoryItemId, productId, projectId, PaginationUtils.getPageable(page, size, "desc", "createdAt"));
    }
}
