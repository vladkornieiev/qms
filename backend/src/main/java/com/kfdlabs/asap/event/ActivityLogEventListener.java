package com.kfdlabs.asap.event;

import com.kfdlabs.asap.entity.ActivityLog;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.User;
import com.kfdlabs.asap.repository.ActivityLogRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ActivityLogEventListener {

    private final ActivityLogRepository activityLogRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void logEntityEvent(EntityEvent event) {
        try {
            Optional<Organization> org = organizationRepository.findById(event.getOrganizationId());
            if (org.isEmpty()) return;

            ActivityLog entry = new ActivityLog();
            entry.setOrganization(org.get());
            entry.setEntityType(event.getEntityType());
            entry.setEntityId(event.getEntityId());
            entry.setAction(event.getEventType());

            // Try to get current user, may be null for scheduled jobs
            try {
                entry.setUser(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
            } catch (Exception e) {
                // System-triggered event, no user context
            }

            Map<String, Object> changes = new HashMap<>();
            if (event.getOldValue() != null) changes.put("old_value", event.getOldValue());
            if (event.getNewValue() != null) changes.put("new_value", event.getNewValue());
            entry.setChanges(changes.isEmpty() ? null : changes);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("source", event.getSource().getClass().getSimpleName());
            entry.setMetadata(metadata);

            activityLogRepository.save(entry);
            log.debug("Activity logged: {}.{} for entity {}", event.getEntityType(), event.getEventType(), event.getEntityId());
        } catch (Exception e) {
            log.error("Failed to log activity for {}.{}: {}", event.getEntityType(), event.getEventType(), e.getMessage());
        }
    }
}
