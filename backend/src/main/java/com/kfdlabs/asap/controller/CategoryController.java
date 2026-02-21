package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.CategoriesApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.CategoryMapper;
import com.kfdlabs.asap.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CategoryController implements CategoriesApi {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @Override
    public ResponseEntity<List<CategoryResponse>> listCategories(String type) {
        return ResponseEntity.ok(categoryService.listCategories(type));
    }

    @Override
    public ResponseEntity<CategoryResponse> getCategory(UUID id) {
        return ResponseEntity.ok(categoryMapper.toDTO(categoryService.getCategory(id)));
    }

    @Override
    public ResponseEntity<CategoryResponse> createCategory(CreateCategoryRequest request) {
        return ResponseEntity.status(201).body(categoryMapper.toDTO(categoryService.createCategory(request)));
    }

    @Override
    public ResponseEntity<CategoryResponse> updateCategory(UUID id, UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryMapper.toDTO(categoryService.updateCategory(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteCategory(UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
