package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateProductRequest;
import com.kfdlabs.asap.dto.UpdateProductRequest;
import com.kfdlabs.asap.entity.Category;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Product;
import com.kfdlabs.asap.repository.CategoryRepository;
import com.kfdlabs.asap.repository.ProductRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<Product> listProducts(String query, String productType, String trackingType, Boolean isActive,
                                       Integer page, Integer size, String sortBy, String order) {
        return productRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, productType, trackingType, isActive, PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public Product getProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return product;
    }

    public Product createProduct(CreateProductRequest request) {
        Product product = new Product();
        product.setOrganization(getCurrentOrg());
        product.setName(request.getName());
        if (request.getParentId() != null) {
            product.setParent(getProduct(request.getParentId()));
        }
        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        }
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getProductType() != null) product.setProductType(request.getProductType());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) product.setUnitPrice(request.getUnitPrice());
        if (request.getPriceUnit() != null) product.setPriceUnit(request.getPriceUnit());
        if (request.getCostPrice() != null) product.setCostPrice(request.getCostPrice());
        if (request.getTrackingType() != null) product.setTrackingType(request.getTrackingType());
        if (request.getUnitOfMeasure() != null) product.setUnitOfMeasure(request.getUnitOfMeasure());
        if (request.getReorderPoint() != null) product.setReorderPoint(request.getReorderPoint());
        if (request.getIsRentable() != null) product.setIsRentable(request.getIsRentable());
        if (request.getIsSellable() != null) product.setIsSellable(request.getIsSellable());
        if (request.getPurchasePrice() != null) product.setPurchasePrice(request.getPurchasePrice());
        if (request.getPurchaseDate() != null) product.setPurchaseDate(request.getPurchaseDate());
        if (request.getDepreciationMethod() != null) product.setDepreciationMethod(request.getDepreciationMethod());
        if (request.getUsefulLifeMonths() != null) product.setUsefulLifeMonths(request.getUsefulLifeMonths());
        if (request.getCustomFields() != null) product.setCustomFields(request.getCustomFields());
        return productRepository.save(product);
    }

    public Product updateProduct(UUID id, UpdateProductRequest request) {
        Product product = getProduct(id);
        if (request.getName() != null) product.setName(request.getName().orElse(product.getName()));
        if (request.getSku() != null) product.setSku(request.getSku().orElse(product.getSku()));
        if (request.getProductType() != null) product.setProductType(request.getProductType().orElse(product.getProductType()));
        if (request.getDescription() != null) product.setDescription(request.getDescription().orElse(product.getDescription()));
        if (request.getUnitPrice() != null) product.setUnitPrice(request.getUnitPrice().orElse(product.getUnitPrice()));
        if (request.getPriceUnit() != null) product.setPriceUnit(request.getPriceUnit().orElse(product.getPriceUnit()));
        if (request.getCostPrice() != null) product.setCostPrice(request.getCostPrice().orElse(product.getCostPrice()));
        if (request.getTrackingType() != null) product.setTrackingType(request.getTrackingType().orElse(product.getTrackingType()));
        if (request.getUnitOfMeasure() != null) product.setUnitOfMeasure(request.getUnitOfMeasure().orElse(product.getUnitOfMeasure()));
        if (request.getReorderPoint() != null) product.setReorderPoint(request.getReorderPoint().orElse(product.getReorderPoint()));
        if (request.getIsRentable() != null) product.setIsRentable(request.getIsRentable().orElse(product.getIsRentable()));
        if (request.getIsSellable() != null) product.setIsSellable(request.getIsSellable().orElse(product.getIsSellable()));
        if (request.getPurchasePrice() != null) product.setPurchasePrice(request.getPurchasePrice().orElse(product.getPurchasePrice()));
        if (request.getPurchaseDate() != null) product.setPurchaseDate(request.getPurchaseDate().orElse(product.getPurchaseDate()));
        if (request.getDepreciationMethod() != null) product.setDepreciationMethod(request.getDepreciationMethod().orElse(product.getDepreciationMethod()));
        if (request.getUsefulLifeMonths() != null) product.setUsefulLifeMonths(request.getUsefulLifeMonths().orElse(product.getUsefulLifeMonths()));
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive().orElse(product.getIsActive()));
        if (request.getDisplayOrder() != null) product.setDisplayOrder(request.getDisplayOrder().orElse(product.getDisplayOrder()));
        if (request.getParentId() != null) {
            UUID parentId = request.getParentId().orElse(null);
            product.setParent(parentId != null ? getProduct(parentId) : null);
        }
        if (request.getCategoryId() != null) {
            UUID categoryId = request.getCategoryId().orElse(null);
            product.setCategory(categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null);
        }
        if (request.getCustomFields() != null) {
            product.setCustomFields(request.getCustomFields().orElse(product.getCustomFields()));
        }
        return productRepository.save(product);
    }

    public void deleteProduct(UUID id) {
        Product product = getProduct(id);
        product.setIsActive(false);
        productRepository.save(product);
    }

    public List<Product> listChildren(UUID parentId) {
        getProduct(parentId); // verify access
        return productRepository.findByOrganizationIdAndParentId(SecurityUtils.getCurrentOrganizationId(), parentId);
    }
}
