package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.InvoiceLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItem, UUID> {

    List<InvoiceLineItem> findByInvoiceIdOrderByDisplayOrderAsc(UUID invoiceId);
}
