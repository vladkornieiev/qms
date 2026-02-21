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

        // In a full implementation, the file would be uploaded to S3/R2 here
        // For now, store the filename as the URL placeholder
        String fileUrl = "/uploads/" + entityType + "/" + entityId + "/" + file.getOriginalFilename();

        FileAttachment attachment = new FileAttachment();
        attachment.setOrganization(org);
        attachment.setEntityType(entityType);
        attachment.setEntityId(entityId);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileUrl(fileUrl);
        attachment.setFileSizeBytes(file.getSize());
        attachment.setMimeType(file.getContentType());
        attachment.setCategory(category);
        attachment.setUploadedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return fileAttachmentRepository.save(attachment);
    }

    public void delete(UUID id) {
        FileAttachment file = get(id);
        // In a full implementation, the file would be deleted from S3/R2 here
        fileAttachmentRepository.delete(file);
    }
}
