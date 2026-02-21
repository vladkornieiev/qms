package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.*;
import com.kfdlabs.asap.event.EntityEvent;
import com.kfdlabs.asap.repository.NotificationRepository;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.repository.WorkflowRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowEngineService {

    private final WorkflowRuleRepository workflowRuleRepository;
    private final NotificationRepository notificationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final EmailService emailService;

    @Transactional
    public void evaluateAndExecute(EntityEvent event) {
        List<WorkflowRule> rules = workflowRuleRepository.findActiveByTrigger(
                event.getOrganizationId(), event.getEntityType(), event.getEventType());

        for (WorkflowRule rule : rules) {
            try {
                if (evaluateConditions(rule.getTriggerConditions(), event)) {
                    log.info("Workflow rule '{}' matched for {}.{} on entity {}",
                            rule.getName(), event.getEntityType(), event.getEventType(), event.getEntityId());
                    executeActions(rule, event);
                }
            } catch (Exception e) {
                log.error("Error executing workflow rule '{}': {}", rule.getName(), e.getMessage(), e);
            }
        }
    }

    private boolean evaluateConditions(Map<String, Object> conditions, EntityEvent event) {
        if (conditions == null || conditions.isEmpty()) {
            return true;
        }

        for (Map.Entry<String, Object> entry : conditions.entrySet()) {
            String field = entry.getKey();
            Object expected = entry.getValue();

            switch (field) {
                case "old_status" -> {
                    if (!Objects.equals(String.valueOf(expected), event.getOldValue())) return false;
                }
                case "new_status" -> {
                    if (!Objects.equals(String.valueOf(expected), event.getNewValue())) return false;
                }
                case "entity_type" -> {
                    if (!Objects.equals(String.valueOf(expected), event.getEntityType())) return false;
                }
                default -> {
                    // For extensibility - additional condition types can be added here
                    log.debug("Unknown condition field: {}", field);
                }
            }
        }
        return true;
    }

    @SuppressWarnings("unchecked")
    private void executeActions(WorkflowRule rule, EntityEvent event) {
        if (rule.getActions() == null) return;

        for (Map<String, Object> action : rule.getActions()) {
            String actionType = (String) action.get("type");
            if (actionType == null) continue;

            switch (actionType) {
                case "send_notification" -> executeSendNotification(action, event, rule);
                case "send_email" -> executeSendEmail(action, event, rule);
                case "log" -> log.info("Workflow rule '{}' log action: {}", rule.getName(), action.get("message"));
                default -> log.warn("Unknown workflow action type: {}", actionType);
            }
        }
    }

    private void executeSendNotification(Map<String, Object> action, EntityEvent event, WorkflowRule rule) {
        String title = resolveTemplate((String) action.getOrDefault("title", "Workflow Notification"), event);
        String body = resolveTemplate((String) action.getOrDefault("body", "Triggered by rule: " + rule.getName()), event);

        String target = (String) action.getOrDefault("target", "all");
        if ("all".equals(target)) {
            List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(event.getOrganizationId());
            for (OrganizationMember member : members) {
                if (member.getIsActive()) {
                    Notification n = new Notification();
                    n.setOrganization(member.getOrganization());
                    n.setUser(member.getUser());
                    n.setTitle(title);
                    n.setBody(body);
                    n.setEntityType(event.getEntityType());
                    n.setEntityId(event.getEntityId());
                    notificationRepository.save(n);
                }
            }
        }
    }

    private void executeSendEmail(Map<String, Object> action, EntityEvent event, WorkflowRule rule) {
        String to = (String) action.get("to");
        String subject = resolveTemplate((String) action.getOrDefault("subject", "Workflow Alert: " + rule.getName()), event);
        String body = resolveTemplate((String) action.getOrDefault("body", "Triggered by rule: " + rule.getName()), event);

        if (to != null) {
            try {
                emailService.sendWorkflowEmail(to, subject, body);
            } catch (Exception e) {
                log.error("Failed to send workflow email to {}: {}", to, e.getMessage());
            }
        }
    }

    private String resolveTemplate(String template, EntityEvent event) {
        if (template == null) return "";
        return template
                .replace("{{entity_type}}", event.getEntityType() != null ? event.getEntityType() : "")
                .replace("{{event_type}}", event.getEventType() != null ? event.getEventType() : "")
                .replace("{{entity_id}}", event.getEntityId() != null ? event.getEntityId().toString() : "")
                .replace("{{old_value}}", event.getOldValue() != null ? event.getOldValue() : "")
                .replace("{{new_value}}", event.getNewValue() != null ? event.getNewValue() : "");
    }
}
