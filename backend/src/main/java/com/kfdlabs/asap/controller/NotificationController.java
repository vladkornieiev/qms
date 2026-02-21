package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.NotificationsApi;
import com.kfdlabs.asap.dto.NotificationListResponse;
import com.kfdlabs.asap.dto.NotificationResponse;
import com.kfdlabs.asap.mapper.ActivityMapper;
import com.kfdlabs.asap.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class NotificationController implements NotificationsApi {

    private final NotificationService notificationService;
    private final ActivityMapper activityMapper;

    @Override
    public ResponseEntity<NotificationListResponse> getNotifications(Integer page, Integer size) {
        return ResponseEntity.ok(activityMapper.toNotificationListDTO(
                notificationService.getForCurrentUser(page, size),
                notificationService.getUnreadCount()));
    }

    @Override
    public ResponseEntity<NotificationResponse> markNotificationAsRead(UUID id) {
        return ResponseEntity.ok(activityMapper.toNotificationDTO(notificationService.markRead(id)));
    }

    @Override
    public ResponseEntity<Void> markAllNotificationsAsRead() {
        notificationService.markAllRead();
        return ResponseEntity.noContent().build();
    }
}
