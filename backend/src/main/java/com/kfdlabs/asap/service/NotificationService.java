package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.Notification;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.NotificationRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public void create(UUID userId, String title, String body, String entityType, UUID entityId) {
        Organization org = organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
        Notification n = new Notification();
        n.setOrganization(org);
        n.setUser(userRepository.findById(userId).orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "User not found")));
        n.setTitle(title);
        n.setBody(body);
        n.setEntityType(entityType);
        n.setEntityId(entityId);
        notificationRepository.save(n);
    }

    public Page<Notification> getForCurrentUser(Integer page, Integer size) {
        return notificationRepository.findByUser(SecurityUtils.getCurrentUserId(), PaginationUtils.getPageable(page, size));
    }

    public long getUnreadCount() {
        return notificationRepository.countUnread(SecurityUtils.getCurrentUserId());
    }

    public Notification markRead(UUID id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        return notificationRepository.save(n);
    }

    public void markAllRead() {
        notificationRepository.markAllRead(SecurityUtils.getCurrentUserId());
    }
}
