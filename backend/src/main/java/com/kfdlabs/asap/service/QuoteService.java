package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Quote;
import com.kfdlabs.asap.entity.QuoteLineItem;
import com.kfdlabs.asap.mapper.QuoteMapper;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final QuoteLineItemRepository lineItemRepository;
    private final OrganizationRepository organizationRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ProductRepository productRepository;
    private final ResourceRepository resourceRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuoteMapper quoteMapper;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    private String generateQuoteNumber(UUID orgId) {
        Integer maxNum = quoteRepository.findMaxQuoteNumber(orgId);
        int next = (maxNum != null ? maxNum : 0) + 1;
        return String.format("Q-%05d", next);
    }

    // ========= Quotes =========

    public Page<Quote> list(String query, String status, UUID clientId, UUID projectId, Integer page, Integer size) {
        return quoteRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, status, clientId, projectId, PaginationUtils.getPageable(page, size));
    }

    public Quote get(UUID id) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Quote not found"));
        if (!quote.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return quote;
    }

    public QuoteDetailResponse getDetail(UUID id) {
        Quote quote = get(id);
        List<QuoteLineItem> lineItems = lineItemRepository.findByQuoteIdOrderByDisplayOrderAsc(id);
        return quoteMapper.toQuoteDetailDTO(quote, lineItems);
    }

    public Quote create(CreateQuoteRequest request) {
        Organization org = getCurrentOrg();
        Quote quote = new Quote();
        quote.setOrganization(org);
        quote.setQuoteNumber(generateQuoteNumber(org.getId()));
        quote.setClient(clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Client not found")));
        if (request.getProjectId() != null) {
            quote.setProject(projectRepository.findById(request.getProjectId()).orElse(null));
        }
        if (request.getTitle() != null) quote.setTitle(request.getTitle());
        if (request.getIssuedDate() != null) quote.setIssuedDate(request.getIssuedDate());
        if (request.getValidUntil() != null) quote.setValidUntil(request.getValidUntil());
        if (request.getCurrency() != null) quote.setCurrency(request.getCurrency());
        if (request.getNotes() != null) quote.setNotes(request.getNotes());
        if (request.getInternalNotes() != null) quote.setInternalNotes(request.getInternalNotes());
        if (request.getTerms() != null) quote.setTerms(request.getTerms());
        if (request.getCustomFields() != null) quote.setCustomFields(request.getCustomFields());
        quote.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return quoteRepository.save(quote);
    }

    public Quote update(UUID id, UpdateQuoteRequest request) {
        Quote quote = get(id);
        if (request.getTitle() != null) quote.setTitle(request.getTitle().orElse(quote.getTitle()));
        if (request.getStatus() != null) quote.setStatus(request.getStatus().orElse(quote.getStatus()));
        if (request.getIssuedDate() != null) quote.setIssuedDate(request.getIssuedDate().orElse(quote.getIssuedDate()));
        if (request.getValidUntil() != null) quote.setValidUntil(request.getValidUntil().orElse(quote.getValidUntil()));
        if (request.getCurrency() != null) quote.setCurrency(request.getCurrency().orElse(quote.getCurrency()));
        if (request.getNotes() != null) quote.setNotes(request.getNotes().orElse(quote.getNotes()));
        if (request.getInternalNotes() != null) quote.setInternalNotes(request.getInternalNotes().orElse(quote.getInternalNotes()));
        if (request.getTerms() != null) quote.setTerms(request.getTerms().orElse(quote.getTerms()));
        if (request.getExternalAccountingId() != null) quote.setExternalAccountingId(request.getExternalAccountingId().orElse(quote.getExternalAccountingId()));
        if (request.getCustomFields() != null) quote.setCustomFields(request.getCustomFields().orElse(quote.getCustomFields()));
        return quoteRepository.save(quote);
    }

    public void delete(UUID id) {
        Quote quote = get(id);
        quoteRepository.delete(quote);
    }

    public Quote send(UUID id) {
        Quote quote = get(id);
        quote.setStatus("sent");
        return quoteRepository.save(quote);
    }

    public Quote createNewVersion(UUID id) {
        Quote original = get(id);
        List<QuoteLineItem> originalItems = lineItemRepository.findByQuoteIdOrderByDisplayOrderAsc(id);

        Quote newQuote = new Quote();
        newQuote.setOrganization(original.getOrganization());
        newQuote.setProject(original.getProject());
        newQuote.setClient(original.getClient());
        newQuote.setQuoteNumber(original.getQuoteNumber());
        newQuote.setVersion(original.getVersion() + 1);
        newQuote.setTitle(original.getTitle());
        newQuote.setCurrency(original.getCurrency());
        newQuote.setNotes(original.getNotes());
        newQuote.setInternalNotes(original.getInternalNotes());
        newQuote.setTerms(original.getTerms());
        newQuote.setCustomFields(original.getCustomFields());
        newQuote.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        newQuote = quoteRepository.save(newQuote);

        for (QuoteLineItem item : originalItems) {
            QuoteLineItem newItem = new QuoteLineItem();
            newItem.setOrganization(item.getOrganization());
            newItem.setQuote(newQuote);
            newItem.setProduct(item.getProduct());
            newItem.setResource(item.getResource());
            newItem.setCategory(item.getCategory());
            newItem.setDescription(item.getDescription());
            newItem.setDateStart(item.getDateStart());
            newItem.setDateEnd(item.getDateEnd());
            newItem.setQuantity(item.getQuantity());
            newItem.setUnitPrice(item.getUnitPrice());
            newItem.setUnit(item.getUnit());
            newItem.setDiscountPercent(item.getDiscountPercent());
            newItem.setDiscountAmount(item.getDiscountAmount());
            newItem.setTaxRate(item.getTaxRate());
            newItem.setLineTotal(item.getLineTotal());
            newItem.setCostPerUnit(item.getCostPerUnit());
            newItem.setCostTotal(item.getCostTotal());
            newItem.setSection(item.getSection());
            newItem.setDisplayOrder(item.getDisplayOrder());
            newItem.setIsVisible(item.getIsVisible());
            newItem.setNotes(item.getNotes());
            lineItemRepository.save(newItem);
        }

        return recalculate(newQuote.getId());
    }

    public Quote approve(UUID id, QuoteApprovalRequest request) {
        Quote quote = get(id);
        quote.setStatus("approved");
        quote.setApprovedAt(LocalDateTime.now());
        if (request.getApprovedByName() != null) quote.setApprovedByName(request.getApprovedByName());
        if (request.getApprovedByEmail() != null) quote.setApprovedByEmail(request.getApprovedByEmail());
        if (request.getSignatureUrl() != null) quote.setApprovalSignatureUrl(request.getSignatureUrl());
        return quoteRepository.save(quote);
    }

    public Quote recalculate(UUID id) {
        Quote quote = get(id);
        List<QuoteLineItem> items = lineItemRepository.findByQuoteIdOrderByDisplayOrderAsc(id);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (QuoteLineItem item : items) {
            BigDecimal gross = item.getQuantity().multiply(item.getUnitPrice());
            BigDecimal discPct = gross.multiply(item.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal discAmt = item.getDiscountAmount();
            BigDecimal afterDiscount = gross.subtract(discPct).subtract(discAmt);
            BigDecimal tax = afterDiscount.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = afterDiscount.add(tax);

            item.setLineTotal(lineTotal);
            if (item.getCostPerUnit() != null) {
                item.setCostTotal(item.getCostPerUnit().multiply(item.getQuantity()));
            }
            lineItemRepository.save(item);

            subtotal = subtotal.add(gross);
            totalDiscount = totalDiscount.add(discPct).add(discAmt);
            totalTax = totalTax.add(tax);
        }

        quote.setSubtotal(subtotal);
        quote.setDiscountAmount(totalDiscount);
        quote.setTaxAmount(totalTax);
        quote.setTotal(subtotal.subtract(totalDiscount).add(totalTax));
        return quoteRepository.save(quote);
    }

    // ========= Line Items =========

    public List<QuoteLineItem> listLineItems(UUID quoteId) {
        get(quoteId);
        return lineItemRepository.findByQuoteIdOrderByDisplayOrderAsc(quoteId);
    }

    public QuoteLineItem createLineItem(UUID quoteId, CreateQuoteLineItemRequest request) {
        Quote quote = get(quoteId);
        QuoteLineItem item = new QuoteLineItem();
        item.setOrganization(quote.getOrganization());
        item.setQuote(quote);
        item.setDescription(request.getDescription());
        if (request.getProductId() != null) item.setProduct(productRepository.findById(request.getProductId()).orElse(null));
        if (request.getResourceId() != null) item.setResource(resourceRepository.findById(request.getResourceId()).orElse(null));
        if (request.getCategoryId() != null) item.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        if (request.getDateStart() != null) item.setDateStart(request.getDateStart());
        if (request.getDateEnd() != null) item.setDateEnd(request.getDateEnd());
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getDiscountPercent() != null) item.setDiscountPercent(request.getDiscountPercent());
        if (request.getDiscountAmount() != null) item.setDiscountAmount(request.getDiscountAmount());
        if (request.getTaxRate() != null) item.setTaxRate(request.getTaxRate());
        if (request.getCostPerUnit() != null) item.setCostPerUnit(request.getCostPerUnit());
        if (request.getSection() != null) item.setSection(request.getSection());
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder());
        if (request.getIsVisible() != null) item.setIsVisible(request.getIsVisible());
        if (request.getNotes() != null) item.setNotes(request.getNotes());

        // Calculate line total
        BigDecimal gross = item.getQuantity().multiply(item.getUnitPrice());
        BigDecimal discPct = gross.multiply(item.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = gross.subtract(discPct).subtract(item.getDiscountAmount());
        BigDecimal tax = afterDiscount.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        item.setLineTotal(afterDiscount.add(tax));
        if (item.getCostPerUnit() != null) {
            item.setCostTotal(item.getCostPerUnit().multiply(item.getQuantity()));
        }

        return lineItemRepository.save(item);
    }

    public QuoteLineItem updateLineItem(UUID quoteId, UUID lineId, UpdateQuoteLineItemRequest request) {
        get(quoteId);
        QuoteLineItem item = lineItemRepository.findById(lineId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Line item not found"));
        if (request.getDescription() != null) item.setDescription(request.getDescription().orElse(item.getDescription()));
        if (request.getDateStart() != null) item.setDateStart(request.getDateStart().orElse(item.getDateStart()));
        if (request.getDateEnd() != null) item.setDateEnd(request.getDateEnd().orElse(item.getDateEnd()));
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity().orElse(item.getQuantity()));
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice().orElse(item.getUnitPrice()));
        if (request.getUnit() != null) item.setUnit(request.getUnit().orElse(item.getUnit()));
        if (request.getDiscountPercent() != null) item.setDiscountPercent(request.getDiscountPercent().orElse(item.getDiscountPercent()));
        if (request.getDiscountAmount() != null) item.setDiscountAmount(request.getDiscountAmount().orElse(item.getDiscountAmount()));
        if (request.getTaxRate() != null) item.setTaxRate(request.getTaxRate().orElse(item.getTaxRate()));
        if (request.getCostPerUnit() != null) item.setCostPerUnit(request.getCostPerUnit().orElse(item.getCostPerUnit()));
        if (request.getSection() != null) item.setSection(request.getSection().orElse(item.getSection()));
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder().orElse(item.getDisplayOrder()));
        if (request.getIsVisible() != null) item.setIsVisible(request.getIsVisible().orElse(item.getIsVisible()));
        if (request.getNotes() != null) item.setNotes(request.getNotes().orElse(item.getNotes()));

        // Recalculate line total
        BigDecimal gross = item.getQuantity().multiply(item.getUnitPrice());
        BigDecimal discPct = gross.multiply(item.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = gross.subtract(discPct).subtract(item.getDiscountAmount());
        BigDecimal tax = afterDiscount.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        item.setLineTotal(afterDiscount.add(tax));
        if (item.getCostPerUnit() != null) {
            item.setCostTotal(item.getCostPerUnit().multiply(item.getQuantity()));
        }

        return lineItemRepository.save(item);
    }

    public void deleteLineItem(UUID quoteId, UUID lineId) {
        get(quoteId);
        lineItemRepository.deleteById(lineId);
    }
}
