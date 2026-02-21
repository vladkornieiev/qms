package com.kfdlabs.asap.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;
import java.util.Set;

@Component
public class StatusTransitionValidator {

    private static final Map<String, Set<String>> INVOICE_TRANSITIONS = Map.of(
            "draft", Set.of("sent", "void"),
            "sent", Set.of("partially_paid", "paid", "overdue", "void"),
            "partially_paid", Set.of("paid", "overdue", "void"),
            "overdue", Set.of("partially_paid", "paid", "void"),
            "paid", Set.of("void"),
            "void", Set.of()
    );

    private static final Map<String, Set<String>> CONTRACT_TRANSITIONS = Map.of(
            "draft", Set.of("sent", "void"),
            "sent", Set.of("signed", "expired", "void"),
            "signed", Set.of("expired", "void"),
            "expired", Set.of("void"),
            "void", Set.of()
    );

    private static final Map<String, Set<String>> QUOTE_TRANSITIONS = Map.of(
            "draft", Set.of("sent"),
            "sent", Set.of("approved", "rejected", "expired"),
            "approved", Set.of("converted"),
            "rejected", Set.of("draft"),
            "expired", Set.of("draft"),
            "converted", Set.of()
    );

    private static final Map<String, Set<String>> PROJECT_TRANSITIONS = Map.of(
            "draft", Set.of("active", "cancelled"),
            "active", Set.of("on_hold", "completed", "cancelled"),
            "on_hold", Set.of("active", "cancelled"),
            "completed", Set.of(),
            "cancelled", Set.of("draft")
    );

    private static final Map<String, Set<String>> RESOURCE_PAYOUT_TRANSITIONS = Map.of(
            "pending", Set.of("approved", "rejected"),
            "approved", Set.of("paid", "rejected"),
            "rejected", Set.of("pending"),
            "paid", Set.of()
    );

    private static final Map<String, Set<String>> INBOUND_REQUEST_TRANSITIONS = Map.of(
            "new", Set.of("in_review", "approved", "denied"),
            "in_review", Set.of("approved", "denied"),
            "approved", Set.of(),
            "denied", Set.of()
    );

    public void validateInvoiceTransition(String currentStatus, String newStatus) {
        validateTransition("Invoice", INVOICE_TRANSITIONS, currentStatus, newStatus);
    }

    public void validateContractTransition(String currentStatus, String newStatus) {
        validateTransition("Contract", CONTRACT_TRANSITIONS, currentStatus, newStatus);
    }

    public void validateQuoteTransition(String currentStatus, String newStatus) {
        validateTransition("Quote", QUOTE_TRANSITIONS, currentStatus, newStatus);
    }

    public void validateProjectTransition(String currentStatus, String newStatus) {
        validateTransition("Project", PROJECT_TRANSITIONS, currentStatus, newStatus);
    }

    public void validateResourcePayoutTransition(String currentStatus, String newStatus) {
        validateTransition("Resource payout", RESOURCE_PAYOUT_TRANSITIONS, currentStatus, newStatus);
    }

    public void validateInboundRequestTransition(String currentStatus, String newStatus) {
        validateTransition("Inbound request", INBOUND_REQUEST_TRANSITIONS, currentStatus, newStatus);
    }

    private void validateTransition(String entityName, Map<String, Set<String>> transitions,
                                     String currentStatus, String newStatus) {
        if (currentStatus == null || newStatus == null || currentStatus.equals(newStatus)) {
            return;
        }
        Set<String> allowed = transitions.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                    String.format("%s cannot transition from '%s' to '%s'", entityName, currentStatus, newStatus));
        }
    }
}
