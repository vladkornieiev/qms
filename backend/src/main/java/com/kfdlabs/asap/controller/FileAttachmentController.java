package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.FilesApi;
import com.kfdlabs.asap.dto.FileAttachmentResponse;
import com.kfdlabs.asap.mapper.FileAttachmentMapper;
import com.kfdlabs.asap.service.FileAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class FileAttachmentController implements FilesApi {

    private final FileAttachmentService fileAttachmentService;
    private final FileAttachmentMapper fileAttachmentMapper;

    @Override
    public ResponseEntity<List<FileAttachmentResponse>> listFileAttachments(String entityType, UUID entityId) {
        return ResponseEntity.ok(fileAttachmentService.listByEntity(entityType, entityId).stream()
                .map(fileAttachmentMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<FileAttachmentResponse> uploadFileAttachment(String entityType, UUID entityId, MultipartFile file, String category) {
        return ResponseEntity.status(201).body(fileAttachmentMapper.toDTO(
                fileAttachmentService.upload(entityType, entityId, file, category)));
    }

    @Override
    public ResponseEntity<FileAttachmentResponse> getFileAttachmentById(UUID id) {
        return ResponseEntity.ok(fileAttachmentMapper.toDTO(fileAttachmentService.get(id)));
    }

    @Override
    public ResponseEntity<Void> deleteFileAttachment(UUID id) {
        fileAttachmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
