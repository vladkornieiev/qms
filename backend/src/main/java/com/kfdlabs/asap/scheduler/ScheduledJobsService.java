package com.kfdlabs.asap.scheduler;

import com.kfdlabs.asap.entity.*;
import com.kfdlabs.asap.event.EntityEvent;
import com.kfdlabs.asap.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledJobsService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final LoginLinkRepository loginLinkRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OneTimePasswordRepository oneTimePasswordRepository;
    private final NotificationRepository notificationRepository;
    private final StockLevelRepository stockLevelRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Runs daily at 6:00 AM UTC - marks overdue invoices and publishes events.
     */
    @Scheduled(cron = "0 0 6 * * *")
    @SchedulerLock(name = "detectOverdueInvoices", lockAtMostFor = "PT5M", lockAtLeastFor = "PT1M")
    @Transactional
    public void detectOverdueInvoices() {
        log.info("Starting overdue invoice detection");
        LocalDate today = LocalDate.now();
        List<Invoice> overdueInvoices = invoiceRepository.findOverdueInvoices(today);

        int count = 0;
        for (Invoice invoice : overdueInvoices) {
            String oldStatus = invoice.getStatus();
            invoice.setStatus("overdue");
            invoiceRepository.save(invoice);
            count++;

            eventPublisher.publishEvent(new EntityEvent(
                    this, "invoice", "status_changed", invoice.getId(),
                    invoice.getOrganization().getId(), oldStatus, "overdue", invoice));
        }

        log.info("Overdue invoice detection completed: {} invoices marked overdue", count);
    }

    /**
     * Runs daily at 7:00 AM UTC - checks for contracts expiring in the next 30 days.
     */
    @Scheduled(cron = "0 0 7 * * *")
    @SchedulerLock(name = "checkExpiringContracts", lockAtMostFor = "PT5M", lockAtLeastFor = "PT1M")
    @Transactional(readOnly = true)
    public void checkExpiringContracts() {
        log.info("Starting contract expiration check");
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(30);
        List<Contract> expiringContracts = contractRepository.findExpiringContracts(today, warningDate);

        for (Contract contract : expiringContracts) {
            long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, contract.getExpiresAt());

            // Publish events at 30, 14, 7, 3, and 1 day(s) before expiry
            if (daysUntilExpiry == 30 || daysUntilExpiry == 14 || daysUntilExpiry == 7
                    || daysUntilExpiry == 3 || daysUntilExpiry == 1) {
                eventPublisher.publishEvent(new EntityEvent(
                        this, "contract", "expiring_soon", contract.getId(),
                        contract.getOrganization().getId(), null, String.valueOf(daysUntilExpiry), contract));
            }
        }

        log.info("Contract expiration check completed: {} contracts expiring within 30 days", expiringContracts.size());
    }

    /**
     * Runs daily at 8:00 AM UTC - checks stock levels below reorder points.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @SchedulerLock(name = "checkLowStockLevels", lockAtMostFor = "PT5M", lockAtLeastFor = "PT1M")
    @Transactional(readOnly = true)
    public void checkLowStockLevels() {
        log.info("Starting low stock level check");
        List<StockLevel> lowStockLevels = stockLevelRepository.findBelowReorderPoint();

        for (StockLevel stockLevel : lowStockLevels) {
            eventPublisher.publishEvent(new EntityEvent(
                    this, "product", "low_stock", stockLevel.getProduct().getId(),
                    stockLevel.getOrganization().getId(), null, null, stockLevel));
        }

        log.info("Low stock check completed: {} products below reorder point", lowStockLevels.size());
    }

    /**
     * Runs every 4 hours - cleans up expired tokens and old read notifications.
     */
    @Scheduled(cron = "0 0 */4 * * *")
    @SchedulerLock(name = "cleanupExpiredTokens", lockAtMostFor = "PT5M", lockAtLeastFor = "PT1M")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting expired token cleanup");
        LocalDateTime now = LocalDateTime.now();

        int loginLinks = loginLinkRepository.deleteExpired(now);
        int resetTokens = passwordResetTokenRepository.deleteExpired(now);
        oneTimePasswordRepository.deleteExpiredCodes(now);
        int oldNotifications = notificationRepository.deleteOldReadNotifications(now.minusDays(30));

        log.info("Token cleanup completed: {} login links, {} reset tokens, {} old notifications removed",
                loginLinks, resetTokens, oldNotifications);
    }
}
