package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.*;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PdfGenerationService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository invoiceLineItemRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteLineItemRepository quoteLineItemRepository;
    private final ContractRepository contractRepository;
    private final OrganizationRepository organizationRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 24, Font.BOLD, new Color(17, 24, 39));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(17, 24, 39));
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(55, 65, 81));
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(107, 114, 128));
    private static final Font TABLE_HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font TABLE_CELL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(55, 65, 81));
    private static final Color TABLE_HEADER_BG = new Color(17, 24, 39);
    private static final Color TABLE_ALT_BG = new Color(249, 250, 251);

    public byte[] generateInvoicePdf(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Invoice not found"));
        if (!invoice.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }

        List<InvoiceLineItem> lineItems = invoiceLineItemRepository.findByInvoiceIdOrderByDisplayOrderAsc(invoiceId);
        Organization org = invoice.getOrganization();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph title = new Paragraph("INVOICE", TITLE_FONT);
            title.setAlignment(Element.ALIGN_RIGHT);
            document.add(title);
            document.add(new Paragraph(" "));

            // Organization & invoice info
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            PdfPCell orgCell = new PdfPCell();
            orgCell.setBorder(Rectangle.NO_BORDER);
            orgCell.addElement(new Paragraph(org.getName(), HEADER_FONT));
            infoTable.addCell(orgCell);

            PdfPCell invoiceInfoCell = new PdfPCell();
            invoiceInfoCell.setBorder(Rectangle.NO_BORDER);
            invoiceInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            invoiceInfoCell.addElement(createRightAligned("Invoice #: " + invoice.getInvoiceNumber(), NORMAL_FONT));
            invoiceInfoCell.addElement(createRightAligned("Status: " + invoice.getStatus().toUpperCase(), NORMAL_FONT));
            if (invoice.getIssuedDate() != null) {
                invoiceInfoCell.addElement(createRightAligned("Issued: " + invoice.getIssuedDate().format(DATE_FORMAT), NORMAL_FONT));
            }
            if (invoice.getDueDate() != null) {
                invoiceInfoCell.addElement(createRightAligned("Due: " + invoice.getDueDate().format(DATE_FORMAT), NORMAL_FONT));
            }
            infoTable.addCell(invoiceInfoCell);
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Client info
            if (invoice.getClient() != null) {
                document.add(new Paragraph("Bill To:", SMALL_FONT));
                document.add(new Paragraph(invoice.getClient().getName(), HEADER_FONT));
                if (invoice.getClient().getEmail() != null) {
                    document.add(new Paragraph(invoice.getClient().getEmail(), NORMAL_FONT));
                }
                document.add(new Paragraph(" "));
            }

            // Line items table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{40, 10, 15, 15, 20});
            addTableHeader(table, "Description", "Qty", "Unit Price", "Tax", "Total");

            int row = 0;
            for (InvoiceLineItem item : lineItems) {
                Color bgColor = (row % 2 == 1) ? TABLE_ALT_BG : Color.WHITE;
                addTableCell(table, item.getDescription(), bgColor);
                addTableCell(table, item.getQuantity().stripTrailingZeros().toPlainString(), bgColor);
                addTableCell(table, formatMoney(item.getUnitPrice()), bgColor);
                addTableCell(table, item.getTaxRate().stripTrailingZeros().toPlainString() + "%", bgColor);
                addTableCell(table, formatMoney(item.getLineTotal()), bgColor);
                row++;
            }
            document.add(table);
            document.add(new Paragraph(" "));

            // Totals
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(50);
            totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            addTotalRow(totalsTable, "Subtotal:", formatMoney(invoice.getSubtotal()));
            if (invoice.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totalsTable, "Discount:", "-" + formatMoney(invoice.getDiscountAmount()));
            }
            if (invoice.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totalsTable, "Tax:", formatMoney(invoice.getTaxAmount()));
            }
            addTotalRow(totalsTable, "Total:", invoice.getCurrency() + " " + formatMoney(invoice.getTotal()));
            addTotalRow(totalsTable, "Paid:", formatMoney(invoice.getAmountPaid()));
            addTotalRow(totalsTable, "Balance Due:", invoice.getCurrency() + " " + formatMoney(invoice.getBalanceDue()));
            document.add(totalsTable);

            // Notes
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Notes:", HEADER_FONT));
                document.add(new Paragraph(invoice.getNotes(), NORMAL_FONT));
            }

            // Terms
            if (invoice.getTerms() != null && !invoice.getTerms().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Terms:", HEADER_FONT));
                document.add(new Paragraph(invoice.getTerms(), NORMAL_FONT));
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating invoice PDF for {}", invoiceId, e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF");
        }
    }

    public byte[] generateQuotePdf(UUID quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Quote not found"));
        if (!quote.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }

        List<QuoteLineItem> lineItems = quoteLineItemRepository.findByQuoteIdOrderByDisplayOrderAsc(quoteId);
        Organization org = quote.getOrganization();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph title = new Paragraph("QUOTE", TITLE_FONT);
            title.setAlignment(Element.ALIGN_RIGHT);
            document.add(title);
            document.add(new Paragraph(" "));

            // Org & quote info
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            PdfPCell orgCell = new PdfPCell();
            orgCell.setBorder(Rectangle.NO_BORDER);
            orgCell.addElement(new Paragraph(org.getName(), HEADER_FONT));
            infoTable.addCell(orgCell);

            PdfPCell quoteInfoCell = new PdfPCell();
            quoteInfoCell.setBorder(Rectangle.NO_BORDER);
            quoteInfoCell.addElement(createRightAligned("Quote #: " + quote.getQuoteNumber() + " v" + quote.getVersion(), NORMAL_FONT));
            quoteInfoCell.addElement(createRightAligned("Status: " + quote.getStatus().toUpperCase(), NORMAL_FONT));
            if (quote.getIssuedDate() != null) {
                quoteInfoCell.addElement(createRightAligned("Issued: " + quote.getIssuedDate().format(DATE_FORMAT), NORMAL_FONT));
            }
            if (quote.getValidUntil() != null) {
                quoteInfoCell.addElement(createRightAligned("Valid Until: " + quote.getValidUntil().format(DATE_FORMAT), NORMAL_FONT));
            }
            infoTable.addCell(quoteInfoCell);
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Client
            if (quote.getClient() != null) {
                document.add(new Paragraph("Prepared For:", SMALL_FONT));
                document.add(new Paragraph(quote.getClient().getName(), HEADER_FONT));
                if (quote.getClient().getEmail() != null) {
                    document.add(new Paragraph(quote.getClient().getEmail(), NORMAL_FONT));
                }
                document.add(new Paragraph(" "));
            }

            // Title if present
            if (quote.getTitle() != null) {
                document.add(new Paragraph(quote.getTitle(), HEADER_FONT));
                document.add(new Paragraph(" "));
            }

            // Line items
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{40, 10, 15, 15, 20});
            addTableHeader(table, "Description", "Qty", "Unit Price", "Tax", "Total");

            int row = 0;
            for (QuoteLineItem item : lineItems) {
                if (!item.getIsVisible()) continue;
                Color bgColor = (row % 2 == 1) ? TABLE_ALT_BG : Color.WHITE;
                addTableCell(table, item.getDescription(), bgColor);
                addTableCell(table, item.getQuantity().stripTrailingZeros().toPlainString(), bgColor);
                addTableCell(table, formatMoney(item.getUnitPrice()), bgColor);
                addTableCell(table, item.getTaxRate().stripTrailingZeros().toPlainString() + "%", bgColor);
                addTableCell(table, formatMoney(item.getLineTotal()), bgColor);
                row++;
            }
            document.add(table);
            document.add(new Paragraph(" "));

            // Totals
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(50);
            totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            addTotalRow(totalsTable, "Subtotal:", formatMoney(quote.getSubtotal()));
            if (quote.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totalsTable, "Discount:", "-" + formatMoney(quote.getDiscountAmount()));
            }
            if (quote.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totalsTable, "Tax:", formatMoney(quote.getTaxAmount()));
            }
            addTotalRow(totalsTable, "Total:", quote.getCurrency() + " " + formatMoney(quote.getTotal()));
            document.add(totalsTable);

            // Notes & Terms
            if (quote.getNotes() != null && !quote.getNotes().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Notes:", HEADER_FONT));
                document.add(new Paragraph(quote.getNotes(), NORMAL_FONT));
            }
            if (quote.getTerms() != null && !quote.getTerms().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Terms:", HEADER_FONT));
                document.add(new Paragraph(quote.getTerms(), NORMAL_FONT));
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating quote PDF for {}", quoteId, e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF");
        }
    }

    public byte[] generateContractPdf(UUID contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Contract not found"));
        if (!contract.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }

        Organization org = contract.getOrganization();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph title = new Paragraph("CONTRACT", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Contract title
            Paragraph contractTitle = new Paragraph(contract.getTitle(), HEADER_FONT);
            contractTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(contractTitle);
            document.add(new Paragraph(" "));

            // Info
            document.add(new Paragraph("Organization: " + org.getName(), NORMAL_FONT));
            document.add(new Paragraph("Contract Type: " + contract.getContractType(), NORMAL_FONT));
            document.add(new Paragraph("Status: " + contract.getStatus().toUpperCase(), NORMAL_FONT));
            if (contract.getClient() != null) {
                document.add(new Paragraph("Client: " + contract.getClient().getName(), NORMAL_FONT));
            }
            if (contract.getExpiresAt() != null) {
                document.add(new Paragraph("Expires: " + contract.getExpiresAt().format(DATE_FORMAT), NORMAL_FONT));
            }
            if (contract.getSignedAt() != null) {
                document.add(new Paragraph("Signed: " + contract.getSignedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")), NORMAL_FONT));
            }
            document.add(new Paragraph(" "));

            // Template content
            if (contract.getTemplateContent() != null && !contract.getTemplateContent().isEmpty()) {
                document.add(new Paragraph(contract.getTemplateContent(), NORMAL_FONT));
            }

            // Notes
            if (contract.getNotes() != null && !contract.getNotes().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Notes:", HEADER_FONT));
                document.add(new Paragraph(contract.getNotes(), NORMAL_FONT));
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating contract PDF for {}", contractId, e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF");
        }
    }

    // Helper methods
    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, TABLE_HEADER_FONT));
            cell.setBackgroundColor(TABLE_HEADER_BG);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String text, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_CELL_FONT));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, HEADER_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, NORMAL_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(4);
        table.addCell(valueCell);
    }

    private Paragraph createRightAligned(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(Element.ALIGN_RIGHT);
        return p;
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0.00";
        return amount.setScale(2).toPlainString();
    }
}
