package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CategoryResponse;
import com.kfdlabs.asap.dto.CreateCategoryRequest;
import com.kfdlabs.asap.dto.UpdateCategoryRequest;
import com.kfdlabs.asap.entity.Category;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.mapper.CategoryMapper;
import com.kfdlabs.asap.repository.CategoryRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final OrganizationRepository organizationRepository;
    private final CategoryMapper categoryMapper;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public List<CategoryResponse> listCategories(String type) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        List<Category> roots = categoryRepository.findByOrganizationIdAndParentIsNullOrderByDisplayOrder(orgId);

        if (type != null && !type.isEmpty()) {
            roots = roots.stream().filter(c -> c.getType().equals(type)).toList();
        }

        return roots.stream().map(this::buildTree).toList();
    }

    private CategoryResponse buildTree(Category category) {
        List<Category> children = categoryRepository.findByOrganizationIdAndParentIdOrderByDisplayOrder(
                category.getOrganization().getId(), category.getId());
        List<CategoryResponse> childDTOs = children.stream().map(this::buildTree).toList();
        return categoryMapper.toDTOWithChildren(category, childDTOs);
    }

    public Category getCategory(UUID id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Category not found"));
        if (!cat.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return cat;
    }

    public Category createCategory(CreateCategoryRequest request) {
        Category cat = new Category();
        cat.setOrganization(getCurrentOrg());
        cat.setName(request.getName());
        cat.setType(request.getType());
        if (request.getCode() != null) cat.setCode(request.getCode());
        if (request.getDescription() != null) cat.setDescription(request.getDescription());
        if (request.getParentId() != null) {
            cat.setParent(getCategory(request.getParentId()));
        }
        if (request.getDisplayOrder() != null) cat.setDisplayOrder(request.getDisplayOrder());
        return categoryRepository.save(cat);
    }

    public Category updateCategory(UUID id, UpdateCategoryRequest request) {
        Category cat = getCategory(id);
        if (request.getName() != null) cat.setName(request.getName().orElse(cat.getName()));
        if (request.getCode() != null) cat.setCode(request.getCode().orElse(cat.getCode()));
        if (request.getType() != null) cat.setType(request.getType().orElse(cat.getType()));
        if (request.getDescription() != null) cat.setDescription(request.getDescription().orElse(cat.getDescription()));
        if (request.getIsActive() != null) cat.setIsActive(request.getIsActive().orElse(cat.getIsActive()));
        if (request.getDisplayOrder() != null) cat.setDisplayOrder(request.getDisplayOrder().orElse(cat.getDisplayOrder()));
        if (request.getParentId() != null) {
            UUID parentId = request.getParentId().orElse(null);
            if (parentId != null) {
                if (parentId.equals(id)) {
                    throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Category cannot be its own parent");
                }
                validateNoCircularReference(id, parentId);
                cat.setParent(getCategory(parentId));
            } else {
                cat.setParent(null);
            }
        }
        return categoryRepository.save(cat);
    }

    private void validateNoCircularReference(UUID categoryId, UUID parentId) {
        UUID current = parentId;
        int depth = 0;
        while (current != null && depth < 20) {
            if (current.equals(categoryId)) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                        "Setting this parent would create a circular reference");
            }
            Category parent = categoryRepository.findById(current).orElse(null);
            current = parent != null && parent.getParent() != null ? parent.getParent().getId() : null;
            depth++;
        }
    }

    public void deleteCategory(UUID id) {
        Category cat = getCategory(id);
        categoryRepository.delete(cat);
    }
}
