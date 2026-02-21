package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.Notification;
import com.kfdlabs.asap.entity.OrganizationMember;
import com.kfdlabs.asap.entity.User;
import com.kfdlabs.asap.repository.NotificationRepository;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class NotificationChannelService {

    private final NotificationRepository notificationRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Creates an in-app notification for a specific user.
     */
    public Notification createInAppNotification(UUID organizationId, UUID userId,
                                                 String title, String body,
                                                 String entityType, UUID entityId) {
        Notification n = new Notification();
        n.setOrganization(organizationRepository.findById(organizationId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found")));
        n.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "User not found")));
        n.setTitle(title);
        n.setBody(body);
        n.setEntityType(entityType);
        n.setEntityId(entityId);
        n.setChannel("in_app");
        return notificationRepository.save(n);
    }

    /**
     * Creates an email notification - sends an email AND creates an in-app notification.
     */
    public Notification createEmailNotification(UUID organizationId, UUID userId,
                                                 String title, String body,
                                                 String entityType, UUID entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "User not found"));

        // Send email
        try {
            emailService.sendWorkflowEmail(user.getEmail(), title, body);
        } catch (Exception e) {
            log.error("Failed to send email notification to user {}: {}", userId, e.getMessage());
        }

        // Also create in-app notification
        Notification n = new Notification();
        n.setOrganization(organizationRepository.findById(organizationId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found")));
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setEntityType(entityType);
        n.setEntityId(entityId);
        n.setChannel("email");
        return notificationRepository.save(n);
    }

    /**
     * Sends a notification via the specified channel to all org members.
     */
    public void notifyAllMembers(UUID organizationId, String channel,
                                  String title, String body,
                                  String entityType, UUID entityId) {
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(organizationId);
        for (OrganizationMember member : members) {
            if (!member.getIsActive()) continue;
            switch (channel) {
                case "email" -> createEmailNotification(organizationId, member.getUser().getId(),
                        title, body, entityType, entityId);
                default -> createInAppNotification(organizationId, member.getUser().getId(),
                        title, body, entityType, entityId);
            }
        }
    }
}
