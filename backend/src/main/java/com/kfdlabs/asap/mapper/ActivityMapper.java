package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.ActivityLog;
import com.kfdlabs.asap.entity.CommunicationLog;
import com.kfdlabs.asap.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class ActivityMapper {

    @Mapping(target = "userId", source = "user.id")
    public abstract ActivityLogResponse toActivityDTO(ActivityLog entity);

    @Mapping(target = "userId", source = "user.id")
    public abstract NotificationResponse toNotificationDTO(Notification entity);

    public abstract CommunicationLogResponse toCommunicationDTO(CommunicationLog entity);

    public PaginatedActivityLogResponse toPaginatedActivityDTO(Page<ActivityLog> page) {
        PaginatedActivityLogResponse response = new PaginatedActivityLogResponse();
        response.setItems(page.getContent().stream().map(this::toActivityDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public NotificationListResponse toNotificationListDTO(Page<Notification> page, long unreadCount) {
        NotificationListResponse response = new NotificationListResponse();
        response.setItems(page.getContent().stream().map(this::toNotificationDTO).toList());
        response.setUnreadCount((int) unreadCount);
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
