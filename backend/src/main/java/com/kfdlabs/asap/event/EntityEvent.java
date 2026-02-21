package com.kfdlabs.asap.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class EntityEvent extends ApplicationEvent {

    private final String entityType;
    private final String eventType;
    private final UUID entityId;
    private final UUID organizationId;
    private final String oldValue;
    private final String newValue;
    private final Object entity;

    public EntityEvent(Object source, String entityType, String eventType,
                       UUID entityId, UUID organizationId,
                       String oldValue, String newValue, Object entity) {
        super(source);
        this.entityType = entityType;
        this.eventType = eventType;
        this.entityId = entityId;
        this.organizationId = organizationId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.entity = entity;
    }
}
