package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Invoice;
import com.kfdlabs.asap.entity.InvoiceLineItem;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Payment;
import com.kfdlabs.asap.entity.Quote;
import com.kfdlabs.asap.entity.QuoteLineItem;
import com.kfdlabs.asap.mapper.InvoiceMapper;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository lineItemRepository;
    private final PaymentRepository paymentRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteLineItemRepository quoteLineItemRepository;
    private final OrganizationRepository organizationRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final InvoiceMapper invoiceMapper;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    private String generateInvoiceNumber(UUID orgId) {
        Integer maxNum = invoiceRepository.findMaxInvoiceNumber(orgId);
        int next = (maxNum != null ? maxNum : 0) + 1;
        return String.format("INV-%05d", next);
    }

    public Page<Invoice> list(String query, String status, UUID clientId, UUID projectId, Integer page, Integer size) {
        return invoiceRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, status, clientId, projectId, PaginationUtils.getPageable(page, size));
    }

    public Invoice get(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Invoice not found"));
        if (!invoice.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return invoice;
    }

    public InvoiceDetailResponse getDetail(UUID id) {
        Invoice invoice = get(id);
        List<InvoiceLineItem> lineItems = lineItemRepository.findByInvoiceIdOrderByDisplayOrderAsc(id);
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(id);
        return invoiceMapper.toDetailDTO(invoice, lineItems, payments);
    }

    public Invoice create(CreateInvoiceRequest request) {
        Organization org = getCurrentOrg();
        Invoice invoice = new Invoice();
        invoice.setOrganization(org);
        invoice.setInvoiceNumber(generateInvoiceNumber(org.getId()));
        invoice.setClient(clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Client not found")));
        if (request.getProjectId() != null) invoice.setProject(projectRepository.findById(request.getProjectId()).orElse(null));
        if (request.getQuoteId() != null) invoice.setQuote(quoteRepository.findById(request.getQuoteId()).orElse(null));
        if (request.getIssuedDate() != null) invoice.setIssuedDate(request.getIssuedDate());
        if (request.getDueDate() != null) invoice.setDueDate(request.getDueDate());
        if (request.getCurrency() != null) invoice.setCurrency(request.getCurrency());
        if (request.getNotes() != null) invoice.setNotes(request.getNotes());
        if (request.getInternalNotes() != null) invoice.setInternalNotes(request.getInternalNotes());
        if (request.getTerms() != null) invoice.setTerms(request.getTerms());
        if (request.getCustomFields() != null) invoice.setCustomFields(request.getCustomFields());
        invoice.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return invoiceRepository.save(invoice);
    }

    public Invoice createFromQuote(UUID quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Quote not found"));
        Organization org = getCurrentOrg();

        Invoice invoice = new Invoice();
        invoice.setOrganization(org);
        invoice.setInvoiceNumber(generateInvoiceNumber(org.getId()));
        invoice.setQuote(quote);
        invoice.setProject(quote.getProject());
        invoice.setClient(quote.getClient());
        invoice.setCurrency(quote.getCurrency());
        invoice.setNotes(quote.getNotes());
        invoice.setTerms(quote.getTerms());
        invoice.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        invoice = invoiceRepository.save(invoice);

        List<QuoteLineItem> quoteItems = quoteLineItemRepository.findByQuoteIdOrderByDisplayOrderAsc(quoteId);
        for (QuoteLineItem qi : quoteItems) {
            InvoiceLineItem li = new InvoiceLineItem();
            li.setOrganization(org);
            li.setInvoice(invoice);
            li.setQuoteLineItem(qi);
            li.setProduct(qi.getProduct());
            li.setCategory(qi.getCategory());
            li.setDescription(qi.getDescription());
            li.setDateStart(qi.getDateStart());
            li.setDateEnd(qi.getDateEnd());
            li.setQuantity(qi.getQuantity());
            li.setUnitPrice(qi.getUnitPrice());
            li.setUnit(qi.getUnit());
            li.setDiscountPercent(qi.getDiscountPercent());
            li.setDiscountAmount(qi.getDiscountAmount());
            li.setTaxRate(qi.getTaxRate());
            li.setLineTotal(qi.getLineTotal());
            li.setSection(qi.getSection());
            li.setDisplayOrder(qi.getDisplayOrder());
            li.setNotes(qi.getNotes());
            lineItemRepository.save(li);
        }

        quote.setStatus("converted");
        quoteRepository.save(quote);

        return recalculate(invoice.getId());
    }

    public Invoice update(UUID id, UpdateInvoiceRequest request) {
        Invoice invoice = get(id);
        if (request.getStatus() != null) invoice.setStatus(request.getStatus().orElse(invoice.getStatus()));
        if (request.getIssuedDate() != null) invoice.setIssuedDate(request.getIssuedDate().orElse(invoice.getIssuedDate()));
        if (request.getDueDate() != null) invoice.setDueDate(request.getDueDate().orElse(invoice.getDueDate()));
        if (request.getCurrency() != null) invoice.setCurrency(request.getCurrency().orElse(invoice.getCurrency()));
        if (request.getNotes() != null) invoice.setNotes(request.getNotes().orElse(invoice.getNotes()));
        if (request.getInternalNotes() != null) invoice.setInternalNotes(request.getInternalNotes().orElse(invoice.getInternalNotes()));
        if (request.getTerms() != null) invoice.setTerms(request.getTerms().orElse(invoice.getTerms()));
        if (request.getExternalAccountingId() != null) invoice.setExternalAccountingId(request.getExternalAccountingId().orElse(invoice.getExternalAccountingId()));
        if (request.getCustomFields() != null) invoice.setCustomFields(request.getCustomFields().orElse(invoice.getCustomFields()));
        return invoiceRepository.save(invoice);
    }

    public void delete(UUID id) {
        Invoice invoice = get(id);
        invoiceRepository.delete(invoice);
    }

    public Invoice send(UUID id) {
        Invoice invoice = get(id);
        invoice.setStatus("sent");
        return invoiceRepository.save(invoice);
    }

    public Invoice voidInvoice(UUID id) {
        Invoice invoice = get(id);
        invoice.setStatus("void");
        return invoiceRepository.save(invoice);
    }

    public Invoice recalculate(UUID id) {
        Invoice invoice = get(id);
        List<InvoiceLineItem> items = lineItemRepository.findByInvoiceIdOrderByDisplayOrderAsc(id);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (InvoiceLineItem item : items) {
            BigDecimal gross = item.getQuantity().multiply(item.getUnitPrice());
            BigDecimal discPct = gross.multiply(item.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal discAmt = item.getDiscountAmount();
            BigDecimal afterDiscount = gross.subtract(discPct).subtract(discAmt);
            BigDecimal tax = afterDiscount.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = afterDiscount.add(tax);
            item.setLineTotal(lineTotal);
            lineItemRepository.save(item);

            subtotal = subtotal.add(gross);
            totalDiscount = totalDiscount.add(discPct).add(discAmt);
            totalTax = totalTax.add(tax);
        }

        invoice.setSubtotal(subtotal);
        invoice.setDiscountAmount(totalDiscount);
        invoice.setTaxAmount(totalTax);
        invoice.setTotal(subtotal.subtract(totalDiscount).add(totalTax));
        invoice.setBalanceDue(invoice.getTotal().subtract(invoice.getAmountPaid()));
        return invoiceRepository.save(invoice);
    }

    // Line items
    public List<InvoiceLineItem> listLineItems(UUID invoiceId) {
        get(invoiceId);
        return lineItemRepository.findByInvoiceIdOrderByDisplayOrderAsc(invoiceId);
    }

    public InvoiceLineItem createLineItem(UUID invoiceId, CreateInvoiceLineItemRequest request) {
        Invoice invoice = get(invoiceId);
        InvoiceLineItem item = new InvoiceLineItem();
        item.setOrganization(invoice.getOrganization());
        item.setInvoice(invoice);
        item.setDescription(request.getDescription());
        if (request.getProductId() != null) item.setProduct(productRepository.findById(request.getProductId()).orElse(null));
        if (request.getCategoryId() != null) item.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        if (request.getDateStart() != null) item.setDateStart(request.getDateStart());
        if (request.getDateEnd() != null) item.setDateEnd(request.getDateEnd());
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getDiscountPercent() != null) item.setDiscountPercent(request.getDiscountPercent());
        if (request.getDiscountAmount() != null) item.setDiscountAmount(request.getDiscountAmount());
        if (request.getTaxRate() != null) item.setTaxRate(request.getTaxRate());
        if (request.getSection() != null) item.setSection(request.getSection());
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder());
        if (request.getNotes() != null) item.setNotes(request.getNotes());

        BigDecimal gross = item.getQuantity().multiply(item.getUnitPrice());
        BigDecimal discPct = gross.multiply(item.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = gross.subtract(discPct).subtract(item.getDiscountAmount());
        BigDecimal tax = afterDiscount.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        item.setLineTotal(afterDiscount.add(tax));

        return lineItemRepository.save(item);
    }

    public InvoiceLineItem updateLineItem(UUID invoiceId, UUID lineId, UpdateInvoiceLineItemRequest request) {
        get(invoiceId);
        InvoiceLineItem item = lineItemRepository.findById(lineId)
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
        if (request.getSection() != null) item.setSection(request.getSection().orElse(item.getSection()));
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder().orElse(item.getDisplayOrder()));
        if (request.getNotes() != null) item.setNotes(request.getNotes().orElse(item.getNotes()));

        BigDecimal gross = item.getQuantity().multiply(item.getUnitPrice());
        BigDecimal discPct = gross.multiply(item.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = gross.subtract(discPct).subtract(item.getDiscountAmount());
        BigDecimal tax = afterDiscount.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        item.setLineTotal(afterDiscount.add(tax));

        return lineItemRepository.save(item);
    }

    public void deleteLineItem(UUID invoiceId, UUID lineId) {
        get(invoiceId);
        lineItemRepository.deleteById(lineId);
    }

    // Payments
    public List<Payment> listPayments(UUID invoiceId) {
        get(invoiceId);
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
    }

    public Page<Payment> listAllPayments(Integer page, Integer size) {
        return paymentRepository.findAllByOrg(SecurityUtils.getCurrentOrganizationId(),
                PaginationUtils.getPageable(page, size));
    }

    public Payment getPayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Payment not found"));
        if (!payment.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return payment;
    }

    public Payment recordPayment(UUID invoiceId, CreatePaymentRequest request) {
        Invoice invoice = get(invoiceId);
        Payment payment = new Payment();
        payment.setOrganization(invoice.getOrganization());
        payment.setInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());
        if (request.getCurrency() != null) payment.setCurrency(request.getCurrency());
        if (request.getPaymentMethod() != null) payment.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentReference() != null) payment.setPaymentReference(request.getPaymentReference());
        if (request.getNotes() != null) payment.setNotes(request.getNotes());
        payment = paymentRepository.save(payment);

        // Update invoice payment totals
        invoice.setAmountPaid(invoice.getAmountPaid().add(request.getAmount()));
        invoice.setBalanceDue(invoice.getTotal().subtract(invoice.getAmountPaid()));
        if (invoice.getAmountPaid().compareTo(invoice.getTotal()) >= 0) {
            invoice.setStatus("paid");
            invoice.setPaidAt(LocalDateTime.now());
        } else if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus("partially_paid");
        }
        invoiceRepository.save(invoice);

        return payment;
    }

    public void deletePayment(UUID id) {
        Payment payment = getPayment(id);
        Invoice invoice = payment.getInvoice();
        invoice.setAmountPaid(invoice.getAmountPaid().subtract(payment.getAmount()));
        invoice.setBalanceDue(invoice.getTotal().subtract(invoice.getAmountPaid()));
        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("sent");
            invoice.setPaidAt(null);
        } else {
            invoice.setStatus("partially_paid");
        }
        invoiceRepository.save(invoice);
        paymentRepository.delete(payment);
    }
}
