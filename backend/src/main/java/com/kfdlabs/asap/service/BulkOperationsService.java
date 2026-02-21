package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.Invoice;
import com.kfdlabs.asap.entity.Notification;
import com.kfdlabs.asap.entity.Quote;
import com.kfdlabs.asap.event.EntityEvent;
import com.kfdlabs.asap.repository.InvoiceRepository;
import com.kfdlabs.asap.repository.NotificationRepository;
import com.kfdlabs.asap.repository.QuoteRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BulkOperationsService {

    private final InvoiceRepository invoiceRepository;
    private final QuoteRepository quoteRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;

    public Map<String, Object> bulkSendInvoices(List<UUID> invoiceIds) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID id : invoiceIds) {
            try {
                Invoice invoice = invoiceRepository.findById(id).orElse(null);
                if (invoice == null || !invoice.getOrganization().getId().equals(orgId)) {
                    errors.add(id + ": not found or access denied");
                    continue;
                }
                if (!"draft".equals(invoice.getStatus())) {
                    errors.add(id + ": invoice is not in draft status");
                    continue;
                }
                String oldStatus = invoice.getStatus();
                invoice.setStatus("sent");
                invoiceRepository.save(invoice);

                // Send email to client if available
                if (invoice.getClient() != null && invoice.getClient().getEmail() != null) {
                    emailService.sendInvoiceEmail(
                            invoice.getClient().getEmail(),
                            invoice.getInvoiceNumber(),
                            invoice.getClient().getName(),
                            invoice.getTotal().toPlainString(),
                            invoice.getCurrency(),
                            invoice.getDueDate() != null ? invoice.getDueDate().toString() : "N/A",
                            ""
                    );
                }

                eventPublisher.publishEvent(new EntityEvent(
                        this, "invoice", "status_changed", invoice.getId(),
                        orgId, oldStatus, "sent", invoice));
                success++;
            } catch (Exception e) {
                errors.add(id + ": " + e.getMessage());
            }
        }

        return Map.of("success", success, "failed", errors.size(), "errors", errors);
    }

    public Map<String, Object> bulkSendPaymentReminders(List<UUID> invoiceIds) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID id : invoiceIds) {
            try {
                Invoice invoice = invoiceRepository.findById(id).orElse(null);
                if (invoice == null || !invoice.getOrganization().getId().equals(orgId)) {
                    errors.add(id + ": not found or access denied");
                    continue;
                }
                if (invoice.getClient() == null || invoice.getClient().getEmail() == null) {
                    errors.add(id + ": no client email");
                    continue;
                }

                emailService.sendReminderEmail(
                        invoice.getClient().getEmail(),
                        "Payment Reminder - Invoice " + invoice.getInvoiceNumber(),
                        "Payment Reminder",
                        "Invoice " + invoice.getInvoiceNumber(),
                        String.format("Balance due: %s %s. Due date: %s",
                                invoice.getCurrency(),
                                invoice.getBalanceDue().toPlainString(),
                                invoice.getDueDate() != null ? invoice.getDueDate().toString() : "N/A"),
                        ""
                );
                success++;
            } catch (Exception e) {
                errors.add(id + ": " + e.getMessage());
            }
        }

        return Map.of("success", success, "failed", errors.size(), "errors", errors);
    }

    public Map<String, Object> bulkSendQuotes(List<UUID> quoteIds) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID id : quoteIds) {
            try {
                Quote quote = quoteRepository.findById(id).orElse(null);
                if (quote == null || !quote.getOrganization().getId().equals(orgId)) {
                    errors.add(id + ": not found or access denied");
                    continue;
                }
                if (!"draft".equals(quote.getStatus())) {
                    errors.add(id + ": quote is not in draft status");
                    continue;
                }
                String oldStatus = quote.getStatus();
                quote.setStatus("sent");
                quoteRepository.save(quote);

                if (quote.getClient() != null && quote.getClient().getEmail() != null) {
                    emailService.sendQuoteEmail(
                            quote.getClient().getEmail(),
                            quote.getQuoteNumber(),
                            quote.getClient().getName(),
                            quote.getTotal().toPlainString(),
                            quote.getCurrency(),
                            quote.getValidUntil() != null ? quote.getValidUntil().toString() : "N/A",
                            ""
                    );
                }

                eventPublisher.publishEvent(new EntityEvent(
                        this, "quote", "status_changed", quote.getId(),
                        orgId, oldStatus, "sent", quote));
                success++;
            } catch (Exception e) {
                errors.add(id + ": " + e.getMessage());
            }
        }

        return Map.of("success", success, "failed", errors.size(), "errors", errors);
    }

    public Map<String, Object> bulkVoidInvoices(List<UUID> invoiceIds) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID id : invoiceIds) {
            try {
                Invoice invoice = invoiceRepository.findById(id).orElse(null);
                if (invoice == null || !invoice.getOrganization().getId().equals(orgId)) {
                    errors.add(id + ": not found or access denied");
                    continue;
                }
                if ("void".equals(invoice.getStatus()) || "paid".equals(invoice.getStatus())) {
                    errors.add(id + ": cannot void a " + invoice.getStatus() + " invoice");
                    continue;
                }
                String oldStatus = invoice.getStatus();
                invoice.setStatus("void");
                invoiceRepository.save(invoice);

                eventPublisher.publishEvent(new EntityEvent(
                        this, "invoice", "status_changed", invoice.getId(),
                        orgId, oldStatus, "void", invoice));
                success++;
            } catch (Exception e) {
                errors.add(id + ": " + e.getMessage());
            }
        }

        return Map.of("success", success, "failed", errors.size(), "errors", errors);
    }

    public Map<String, Object> bulkDeleteNotifications(List<UUID> notificationIds) {
        UUID userId = SecurityUtils.getCurrentUserId();
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID id : notificationIds) {
            try {
                Notification n = notificationRepository.findById(id).orElse(null);
                if (n == null || !n.getUser().getId().equals(userId)) {
                    errors.add(id + ": not found or access denied");
                    continue;
                }
                notificationRepository.delete(n);
                success++;
            } catch (Exception e) {
                errors.add(id + ": " + e.getMessage());
            }
        }

        return Map.of("success", success, "failed", errors.size(), "errors", errors);
    }
}
