package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Invoice;
import com.kfdlabs.asap.entity.InvoiceLineItem;
import com.kfdlabs.asap.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class InvoiceMapper {

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", expression = "java(entity.getClient() != null ? entity.getClient().getName() : null)")
    @Mapping(target = "quoteId", source = "quote.id")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "createdById", source = "createdBy.id")
    public abstract InvoiceResponse toDTO(Invoice entity);

    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "quoteLineItemId", source = "quoteLineItem.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "categoryId", source = "category.id")
    public abstract InvoiceLineItemResponse toLineItemDTO(InvoiceLineItem entity);

    @Mapping(target = "invoiceId", source = "invoice.id")
    public abstract PaymentResponse toPaymentDTO(Payment entity);

    public InvoiceDetailResponse toDetailDTO(Invoice entity, List<InvoiceLineItem> lineItems, List<Payment> payments) {
        InvoiceDetailResponse response = new InvoiceDetailResponse();
        response.setId(entity.getId());
        response.setQuoteId(entity.getQuote() != null ? entity.getQuote().getId() : null);
        response.setProjectId(entity.getProject() != null ? entity.getProject().getId() : null);
        response.setClientId(entity.getClient() != null ? entity.getClient().getId() : null);
        response.setClientName(entity.getClient() != null ? entity.getClient().getName() : null);
        response.setInvoiceNumber(entity.getInvoiceNumber());
        response.setStatus(entity.getStatus());
        response.setIssuedDate(entity.getIssuedDate());
        response.setDueDate(entity.getDueDate());
        response.setPaidAt(entity.getPaidAt());
        response.setSubtotal(entity.getSubtotal());
        response.setDiscountAmount(entity.getDiscountAmount());
        response.setTaxAmount(entity.getTaxAmount());
        response.setTotal(entity.getTotal());
        response.setAmountPaid(entity.getAmountPaid());
        response.setBalanceDue(entity.getBalanceDue());
        response.setCurrency(entity.getCurrency());
        response.setExternalAccountingId(entity.getExternalAccountingId());
        response.setNotes(entity.getNotes());
        response.setInternalNotes(entity.getInternalNotes());
        response.setTerms(entity.getTerms());
        response.setCustomFields(entity.getCustomFields());
        response.setCreatedById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null);
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setLineItems(lineItems.stream().map(this::toLineItemDTO).toList());
        response.setPayments(payments.stream().map(this::toPaymentDTO).toList());
        return response;
    }

    public PaginatedInvoiceResponse toPaginatedDTO(Page<Invoice> page) {
        PaginatedInvoiceResponse response = new PaginatedInvoiceResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedPaymentResponse toPaginatedPaymentDTO(Page<Payment> page) {
        PaginatedPaymentResponse response = new PaginatedPaymentResponse();
        response.setItems(page.getContent().stream().map(this::toPaymentDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
