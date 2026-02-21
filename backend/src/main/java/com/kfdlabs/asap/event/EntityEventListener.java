package com.kfdlabs.asap.event;

import com.kfdlabs.asap.entity.*;
import com.kfdlabs.asap.repository.NotificationRepository;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.service.EmailService;
import com.kfdlabs.asap.service.WorkflowEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EntityEventListener {

    private final NotificationRepository notificationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final WorkflowEngineService workflowEngineService;
    private final EmailService emailService;

    @Async
    @EventListener
    public void handleEntityEvent(EntityEvent event) {
        log.debug("Handling entity event: {}.{} for entity {}", event.getEntityType(), event.getEventType(), event.getEntityId());

        try {
            // Create in-app notifications for relevant users
            createNotificationsForEvent(event);

            // Evaluate and execute workflow rules
            workflowEngineService.evaluateAndExecute(event);
        } catch (Exception e) {
            log.error("Error handling entity event: {}.{} for entity {}",
                    event.getEntityType(), event.getEventType(), event.getEntityId(), e);
        }
    }

    private void createNotificationsForEvent(EntityEvent event) {
        String title;
        String body;

        switch (event.getEntityType() + "." + event.getEventType()) {
            case "invoice.status_changed" -> {
                if ("overdue".equals(event.getNewValue())) {
                    Invoice invoice = (Invoice) event.getEntity();
                    title = "Invoice Overdue";
                    body = String.format("Invoice %s is now overdue. Balance due: %s %s",
                            invoice.getInvoiceNumber(), invoice.getCurrency(), invoice.getBalanceDue());
                } else {
                    return;
                }
            }
            case "invoice.payment_received" -> {
                Invoice invoice = (Invoice) event.getEntity();
                title = "Payment Received";
                body = String.format("Payment received for invoice %s", invoice.getInvoiceNumber());
            }
            case "contract.expiring_soon" -> {
                Contract contract = (Contract) event.getEntity();
                title = "Contract Expiring Soon";
                body = String.format("Contract \"%s\" expires in %s day(s)", contract.getTitle(), event.getNewValue());
            }
            case "product.low_stock" -> {
                StockLevel stockLevel = (StockLevel) event.getEntity();
                Product product = stockLevel.getProduct();
                title = "Low Stock Alert";
                body = String.format("Product \"%s\" at %s: %s on hand (reorder point: %d)",
                        product.getName(), stockLevel.getLocation(),
                        stockLevel.getQuantityOnHand().stripTrailingZeros().toPlainString(),
                        product.getReorderPoint());
            }
            case "quote.status_changed" -> {
                Quote quote = (Quote) event.getEntity();
                title = "Quote Status Changed";
                body = String.format("Quote %s status changed to %s", quote.getQuoteNumber(), event.getNewValue());
            }
            case "project.status_changed" -> {
                Project project = (Project) event.getEntity();
                title = "Project Status Changed";
                body = String.format("Project \"%s\" status changed to %s", project.getTitle(), event.getNewValue());
            }
            default -> {
                return;
            }
        }

        // Notify all active members of the organization
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(event.getOrganizationId());
        for (OrganizationMember member : members) {
            if (member.getIsActive()) {
                Notification notification = new Notification();
                notification.setOrganization(member.getOrganization());
                notification.setUser(member.getUser());
                notification.setTitle(title);
                notification.setBody(body);
                notification.setEntityType(event.getEntityType());
                notification.setEntityId(event.getEntityId());
                notificationRepository.save(notification);
            }
        }
    }
}
