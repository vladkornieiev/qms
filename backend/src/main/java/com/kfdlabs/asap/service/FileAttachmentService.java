package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.FileAttachment;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.mapper.FileAttachmentMapper;
import com.kfdlabs.asap.repository.FileAttachmentRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FileAttachmentService {

    private final FileAttachmentRepository fileAttachmentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final FileAttachmentMapper fileAttachmentMapper;
    private final S3Service s3Service;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "text/csv",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js",
            ".msi", ".dll", ".com", ".scr", ".pif", ".hta"
    );

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public List<FileAttachment> listByEntity(String entityType, UUID entityId) {
        return fileAttachmentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    public FileAttachment get(UUID id) {
        FileAttachment file = fileAttachmentRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return file;
    }

    public FileAttachment upload(String entityType, UUID entityId, MultipartFile file, String category) {
        Organization org = getCurrentOrg();

        validateFile(file);

        String s3Key = buildS3Key(org.getId(), entityType, entityId, file.getOriginalFilename());
        try {
            s3Service.saveFileToS3(file.getBytes(), s3Key, file.getContentType());
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", s3Key, e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
        }

        FileAttachment attachment = new FileAttachment();
        attachment.setOrganization(org);
        attachment.setEntityType(entityType);
        attachment.setEntityId(entityId);
        attachment.setFileName(sanitizeFilename(file.getOriginalFilename()));
        attachment.setS3Key(s3Key);
        attachment.setFileUrl(s3Key);
        attachment.setFileSizeBytes(file.getSize());
        attachment.setMimeType(file.getContentType());
        attachment.setCategory(category);
        attachment.setUploadedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return fileAttachmentRepository.save(attachment);
    }

    public void delete(UUID id) {
        FileAttachment file = get(id);
        if (file.getS3Key() != null) {
            try {
                s3Service.deleteFileFromS3(file.getS3Key());
            } catch (Exception e) {
                log.warn("Failed to delete file from S3: {}", file.getS3Key(), e);
            }
        }
        fileAttachmentRepository.delete(file);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                    "File size exceeds maximum allowed size of 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                    "File type '" + contentType + "' is not allowed");
        }
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String lower = filename.toLowerCase();
            for (String ext : BLOCKED_EXTENSIONS) {
                if (lower.endsWith(ext)) {
                    throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                            "File extension '" + ext + "' is not allowed");
                }
            }
        }
    }

    private String buildS3Key(UUID orgId, String entityType, UUID entityId, String originalFilename) {
        String sanitized = sanitizeFilename(originalFilename);
        return String.format("orgs/%s/%s/%s/%s_%s",
                orgId, entityType, entityId, UUID.randomUUID().toString().substring(0, 8), sanitized);
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "unnamed";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
