package com.kfdlabs.asap.scheduler;

import com.kfdlabs.asap.entity.Integration;
import com.kfdlabs.asap.entity.IntegrationSyncLog;
import com.kfdlabs.asap.repository.IntegrationRepository;
import com.kfdlabs.asap.repository.IntegrationSyncLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntegrationSyncScheduler {

    private final IntegrationRepository integrationRepository;
    private final IntegrationSyncLogRepository syncLogRepository;

    /**
     * Runs every 6 hours - syncs all connected integrations.
     */
    @Scheduled(cron = "0 0 */6 * * *")
    @SchedulerLock(name = "syncAllIntegrations", lockAtMostFor = "PT30M", lockAtLeastFor = "PT5M")
    @Transactional
    public void syncAllIntegrations() {
        log.info("Starting scheduled integration sync");
        List<Integration> connectedIntegrations = integrationRepository.findAllConnected();

        int successCount = 0;
        int failCount = 0;

        for (Integration integration : connectedIntegrations) {
            try {
                syncIntegration(integration);
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("Failed to sync integration {} (provider: {}): {}",
                        integration.getId(), integration.getProvider(), e.getMessage());

                IntegrationSyncLog errorLog = new IntegrationSyncLog();
                errorLog.setOrganization(integration.getOrganization());
                errorLog.setIntegration(integration);
                errorLog.setDirection("pull");
                errorLog.setEntityType("scheduled_sync");
                errorLog.setStatus("error");
                errorLog.setErrorMessage(e.getMessage());
                syncLogRepository.save(errorLog);
            }
        }

        log.info("Scheduled integration sync completed: {} succeeded, {} failed", successCount, failCount);
    }

    private void syncIntegration(Integration integration) {
        log.debug("Syncing integration {} (provider: {})", integration.getId(), integration.getProvider());

        // Provider-specific sync logic
        switch (integration.getProvider()) {
            case "quickbooks" -> syncQuickbooks(integration);
            case "xero" -> syncXero(integration);
            case "stripe" -> syncStripe(integration);
            default -> {
                log.debug("No sync handler for provider: {}", integration.getProvider());
                return;
            }
        }

        integration.setLastSyncedAt(LocalDateTime.now());
        integrationRepository.save(integration);

        IntegrationSyncLog successLog = new IntegrationSyncLog();
        successLog.setOrganization(integration.getOrganization());
        successLog.setIntegration(integration);
        successLog.setDirection("pull");
        successLog.setEntityType("scheduled_sync");
        successLog.setStatus("success");
        syncLogRepository.save(successLog);
    }

    private void syncQuickbooks(Integration integration) {
        // Placeholder for QuickBooks sync logic
        log.info("QuickBooks sync placeholder for integration {}", integration.getId());
    }

    private void syncXero(Integration integration) {
        // Placeholder for Xero sync logic
        log.info("Xero sync placeholder for integration {}", integration.getId());
    }

    private void syncStripe(Integration integration) {
        // Placeholder for Stripe sync logic
        log.info("Stripe sync placeholder for integration {}", integration.getId());
    }
}
