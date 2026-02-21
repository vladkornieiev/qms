package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateVendorContactRequest;
import com.kfdlabs.asap.dto.CreateVendorRequest;
import com.kfdlabs.asap.dto.UpdateVendorContactRequest;
import com.kfdlabs.asap.dto.UpdateVendorRequest;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Vendor;
import com.kfdlabs.asap.entity.VendorContact;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.VendorContactRepository;
import com.kfdlabs.asap.repository.VendorRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class VendorService {

    private final VendorRepository vendorRepository;
    private final VendorContactRepository vendorContactRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<Vendor> listVendors(String query, String type, Boolean isActive,
                                      Integer page, Integer size, String sortBy, String order) {
        return vendorRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, type, isActive, PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public Vendor getVendor(UUID id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Vendor not found"));
        if (!vendor.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return vendor;
    }

    public Vendor createVendor(CreateVendorRequest request) {
        // Duplicate detection by email within organization
        if (request.getEmail() != null) {
            vendorRepository.findAll(SecurityUtils.getCurrentOrganizationId(), null, null, null,
                    org.springframework.data.domain.Pageable.unpaged())
                    .getContent().stream()
                    .filter(v -> request.getEmail().equalsIgnoreCase(v.getEmail()))
                    .findFirst()
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT,
                                "A vendor with email '" + request.getEmail() + "' already exists");
                    });
        }
        Vendor vendor = new Vendor();
        vendor.setOrganization(getCurrentOrg());
        vendor.setName(request.getName());
        if (request.getType() != null) vendor.setType(request.getType());
        if (request.getEmail() != null) vendor.setEmail(request.getEmail());
        if (request.getPhone() != null) vendor.setPhone(request.getPhone());
        if (request.getWebsite() != null) vendor.setWebsite(request.getWebsite());
        if (request.getBillingAddress() != null) vendor.setBillingAddress(request.getBillingAddress());
        if (request.getNotes() != null) vendor.setNotes(request.getNotes());
        if (request.getPaymentInfo() != null) vendor.setPaymentInfo(request.getPaymentInfo());
        if (request.getCustomFields() != null) vendor.setCustomFields(request.getCustomFields());
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(UUID id, UpdateVendorRequest request) {
        Vendor vendor = getVendor(id);
        if (request.getName() != null) vendor.setName(request.getName().orElse(vendor.getName()));
        if (request.getType() != null) vendor.setType(request.getType().orElse(vendor.getType()));
        if (request.getEmail() != null) vendor.setEmail(request.getEmail().orElse(vendor.getEmail()));
        if (request.getPhone() != null) vendor.setPhone(request.getPhone().orElse(vendor.getPhone()));
        if (request.getWebsite() != null) vendor.setWebsite(request.getWebsite().orElse(vendor.getWebsite()));
        if (request.getNotes() != null) vendor.setNotes(request.getNotes().orElse(vendor.getNotes()));
        if (request.getIsActive() != null) vendor.setIsActive(request.getIsActive().orElse(vendor.getIsActive()));
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(UUID id) {
        Vendor vendor = getVendor(id);
        vendor.setIsActive(false);
        vendorRepository.save(vendor);
    }

    // Contacts
    public List<VendorContact> listContacts(UUID vendorId) {
        getVendor(vendorId);
        return vendorContactRepository.findByVendorId(vendorId);
    }

    public VendorContact createContact(UUID vendorId, CreateVendorContactRequest request) {
        Vendor vendor = getVendor(vendorId);
        VendorContact contact = new VendorContact();
        contact.setOrganization(vendor.getOrganization());
        contact.setVendor(vendor);
        contact.setFirstName(request.getFirstName());
        if (request.getLastName() != null) contact.setLastName(request.getLastName());
        if (request.getEmail() != null) contact.setEmail(request.getEmail());
        if (request.getPhone() != null) contact.setPhone(request.getPhone());
        if (request.getRole() != null) contact.setRole(request.getRole());
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary());
        return vendorContactRepository.save(contact);
    }

    public VendorContact updateContact(UUID vendorId, UUID contactId, UpdateVendorContactRequest request) {
        getVendor(vendorId);
        VendorContact contact = vendorContactRepository.findById(contactId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Contact not found"));
        if (request.getFirstName() != null) contact.setFirstName(request.getFirstName().orElse(contact.getFirstName()));
        if (request.getLastName() != null) contact.setLastName(request.getLastName().orElse(contact.getLastName()));
        if (request.getEmail() != null) contact.setEmail(request.getEmail().orElse(contact.getEmail()));
        if (request.getPhone() != null) contact.setPhone(request.getPhone().orElse(contact.getPhone()));
        if (request.getRole() != null) contact.setRole(request.getRole().orElse(contact.getRole()));
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary().orElse(contact.getIsPrimary()));
        return vendorContactRepository.save(contact);
    }

    public void deleteContact(UUID vendorId, UUID contactId) {
        getVendor(vendorId);
        vendorContactRepository.deleteById(contactId);
    }
}
