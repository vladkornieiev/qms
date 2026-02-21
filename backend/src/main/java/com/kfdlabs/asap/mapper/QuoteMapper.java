package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.InboundRequest;
import com.kfdlabs.asap.entity.Quote;
import com.kfdlabs.asap.entity.QuoteLineItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class QuoteMapper {

    @Mapping(target = "reviewedById", source = "reviewedBy.id")
    @Mapping(target = "clientId", source = "client.id")
    public abstract InboundRequestResponse toInboundRequestDTO(InboundRequest entity);

    public PaginatedInboundRequestResponse toPaginatedInboundRequestDTO(Page<InboundRequest> page) {
        PaginatedInboundRequestResponse response = new PaginatedInboundRequestResponse();
        response.setItems(page.getContent().stream().map(this::toInboundRequestDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", expression = "java(entity.getClient() != null ? entity.getClient().getName() : null)")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "createdById", source = "createdBy.id")
    public abstract QuoteResponse toQuoteDTO(Quote entity);

    @Mapping(target = "quoteId", source = "quote.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "resourceId", source = "resource.id")
    @Mapping(target = "categoryId", source = "category.id")
    public abstract QuoteLineItemResponse toLineItemDTO(QuoteLineItem entity);

    public QuoteDetailResponse toQuoteDetailDTO(Quote entity, List<QuoteLineItem> lineItems) {
        QuoteDetailResponse response = new QuoteDetailResponse();
        response.setId(entity.getId());
        response.setProjectId(entity.getProject() != null ? entity.getProject().getId() : null);
        response.setClientId(entity.getClient() != null ? entity.getClient().getId() : null);
        response.setClientName(entity.getClient() != null ? entity.getClient().getName() : null);
        response.setQuoteNumber(entity.getQuoteNumber());
        response.setVersion(entity.getVersion());
        response.setTitle(entity.getTitle());
        response.setStatus(entity.getStatus());
        response.setIssuedDate(entity.getIssuedDate());
        response.setValidUntil(entity.getValidUntil());
        response.setApprovedAt(entity.getApprovedAt());
        response.setSubtotal(entity.getSubtotal());
        response.setDiscountAmount(entity.getDiscountAmount());
        response.setTaxAmount(entity.getTaxAmount());
        response.setTotal(entity.getTotal());
        response.setCurrency(entity.getCurrency());
        response.setNotes(entity.getNotes());
        response.setInternalNotes(entity.getInternalNotes());
        response.setTerms(entity.getTerms());
        response.setExternalAccountingId(entity.getExternalAccountingId());
        response.setApprovedByName(entity.getApprovedByName());
        response.setApprovedByEmail(entity.getApprovedByEmail());
        response.setCustomFields(entity.getCustomFields());
        response.setCreatedById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null);
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setLineItems(lineItems.stream().map(this::toLineItemDTO).toList());
        return response;
    }

    public PaginatedQuoteResponse toPaginatedQuoteDTO(Page<Quote> page) {
        PaginatedQuoteResponse response = new PaginatedQuoteResponse();
        response.setItems(page.getContent().stream().map(this::toQuoteDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
