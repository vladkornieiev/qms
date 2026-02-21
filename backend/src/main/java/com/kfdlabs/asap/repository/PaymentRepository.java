package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(UUID invoiceId);

    @Query("SELECT p FROM Payment p WHERE p.organization.id = :orgId ORDER BY p.paymentDate DESC")
    Page<Payment> findAllByOrg(UUID orgId, Pageable pageable);
}
