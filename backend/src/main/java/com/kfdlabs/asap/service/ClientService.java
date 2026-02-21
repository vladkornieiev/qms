package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateClientContactRequest;
import com.kfdlabs.asap.dto.CreateClientRequest;
import com.kfdlabs.asap.dto.UpdateClientContactRequest;
import com.kfdlabs.asap.dto.UpdateClientRequest;
import com.kfdlabs.asap.entity.Client;
import com.kfdlabs.asap.entity.ClientContact;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.ClientContactRepository;
import com.kfdlabs.asap.repository.ClientRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
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
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientContactRepository clientContactRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<Client> listClients(String query, String type, Boolean isActive,
                                      Integer page, Integer size, String sortBy, String order) {
        return clientRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, type, isActive, PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public Client getClient(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Client not found"));
        if (!client.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return client;
    }

    public Client createClient(CreateClientRequest request) {
        // Duplicate detection by email within organization
        if (request.getEmail() != null) {
            clientRepository.findAll(SecurityUtils.getCurrentOrganizationId(), null, null, null,
                    org.springframework.data.domain.Pageable.unpaged())
                    .getContent().stream()
                    .filter(c -> request.getEmail().equalsIgnoreCase(c.getEmail()))
                    .findFirst()
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT,
                                "A client with email '" + request.getEmail() + "' already exists");
                    });
        }
        Client client = new Client();
        client.setOrganization(getCurrentOrg());
        client.setName(request.getName());
        if (request.getType() != null) client.setType(request.getType());
        if (request.getEmail() != null) client.setEmail(request.getEmail());
        if (request.getPhone() != null) client.setPhone(request.getPhone());
        if (request.getWebsite() != null) client.setWebsite(request.getWebsite());
        if (request.getBillingAddress() != null) client.setBillingAddress(request.getBillingAddress());
        if (request.getShippingAddress() != null) client.setShippingAddress(request.getShippingAddress());
        if (request.getNotes() != null) client.setNotes(request.getNotes());
        if (request.getPricingTier() != null) client.setPricingTier(request.getPricingTier());
        if (request.getCustomFields() != null) client.setCustomFields(request.getCustomFields());
        return clientRepository.save(client);
    }

    public Client updateClient(UUID id, UpdateClientRequest request) {
        Client client = getClient(id);
        if (request.getName() != null) client.setName(request.getName().orElse(client.getName()));
        if (request.getType() != null) client.setType(request.getType().orElse(client.getType()));
        if (request.getEmail() != null) client.setEmail(request.getEmail().orElse(client.getEmail()));
        if (request.getPhone() != null) client.setPhone(request.getPhone().orElse(client.getPhone()));
        if (request.getWebsite() != null) client.setWebsite(request.getWebsite().orElse(client.getWebsite()));
        if (request.getNotes() != null) client.setNotes(request.getNotes().orElse(client.getNotes()));
        if (request.getIsActive() != null) client.setIsActive(request.getIsActive().orElse(client.getIsActive()));
        if (request.getPricingTier() != null) client.setPricingTier(request.getPricingTier().orElse(client.getPricingTier()));
        return clientRepository.save(client);
    }

    public void deleteClient(UUID id) {
        Client client = getClient(id);
        client.setIsActive(false);
        clientRepository.save(client);
    }

    // Contacts
    public List<ClientContact> listContacts(UUID clientId) {
        getClient(clientId); // verify access
        return clientContactRepository.findByClientId(clientId);
    }

    public ClientContact createContact(UUID clientId, CreateClientContactRequest request) {
        Client client = getClient(clientId);
        ClientContact contact = new ClientContact();
        contact.setOrganization(client.getOrganization());
        contact.setClient(client);
        contact.setFirstName(request.getFirstName());
        if (request.getLastName() != null) contact.setLastName(request.getLastName());
        if (request.getEmail() != null) contact.setEmail(request.getEmail());
        if (request.getPhone() != null) contact.setPhone(request.getPhone());
        if (request.getRole() != null) contact.setRole(request.getRole());
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary());
        return clientContactRepository.save(contact);
    }

    public ClientContact updateContact(UUID clientId, UUID contactId, UpdateClientContactRequest request) {
        getClient(clientId); // verify access
        ClientContact contact = clientContactRepository.findById(contactId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Contact not found"));
        if (request.getFirstName() != null) contact.setFirstName(request.getFirstName().orElse(contact.getFirstName()));
        if (request.getLastName() != null) contact.setLastName(request.getLastName().orElse(contact.getLastName()));
        if (request.getEmail() != null) contact.setEmail(request.getEmail().orElse(contact.getEmail()));
        if (request.getPhone() != null) contact.setPhone(request.getPhone().orElse(contact.getPhone()));
        if (request.getRole() != null) contact.setRole(request.getRole().orElse(contact.getRole()));
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary().orElse(contact.getIsPrimary()));
        return clientContactRepository.save(contact);
    }

    public void deleteContact(UUID clientId, UUID contactId) {
        getClient(clientId); // verify access
        clientContactRepository.deleteById(contactId);
    }
}
