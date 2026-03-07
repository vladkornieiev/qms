package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CustomFieldFilter;
import com.kfdlabs.asap.dto.SearchClientsRequest;
import com.kfdlabs.asap.dto.UpdateClientRequest;
import com.kfdlabs.asap.dto.CreateClientRequest;
import com.kfdlabs.asap.entity.Client;
import com.kfdlabs.asap.entity.CustomFieldDefinition;
import com.kfdlabs.asap.repository.ClientRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.specification.EntityFilterSpecifications;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.UUID;

import static org.openapitools.jackson.nullable.JsonNullable.undefined;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final EntityTagService entityTagService;
    private final EntityCustomFieldService entityCustomFieldService;
    private final CustomFieldService customFieldService;

    public Client createClient(CreateClientRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        Client client = new Client();
        client.setOrganizationId(orgId);
        client.setName(request.getName());
        client.setType(request.getType() != null ? request.getType().getValue() : "COMPANY");
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setWebsite(request.getWebsite());
        client.setBillingAddress(request.getBillingAddress() != null ? request.getBillingAddress().toString() : null);
        client.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress().toString() : null);
        client.setNotes(request.getNotes());
        client.setExternalAccountingId(request.getExternalAccountingId());
        client.setPricingTier(request.getPricingTier());
        client = clientRepository.save(client);

        // Set tags if provided
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            entityTagService.setEntityTags("CLIENT", client.getId(), request.getTagIds());
        }

        // Set custom field values if provided
        if (request.getCustomFieldValues() != null && !request.getCustomFieldValues().isEmpty()) {
            entityCustomFieldService.setEntityCustomFieldValues(client.getId(),
                    request.getCustomFieldValues().stream()
                            .map(v -> new EntityCustomFieldService.CustomFieldValueInput(
                                    v.getCustomFieldId(), v.getValue()))
                            .toList());
        }

        return client;
    }

    @Transactional(readOnly = true)
    public Client getClientById(UUID id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.client.not.found"));
    }

    public Client updateClient(UUID id, UpdateClientRequest request) {
        Client client = getClientById(id);

        if (request.getName() != null && !request.getName().equals(undefined())) {
            client.setName(request.getName().orElse(""));
        }
        if (request.getType() != null && !request.getType().equals(undefined())) {
            client.setType(request.getType().isPresent() ? request.getType().get().name() : null);
        }
        if (request.getEmail() != null && !request.getEmail().equals(undefined())) {
            client.setEmail(request.getEmail().orElse(null));
        }
        if (request.getPhone() != null && !request.getPhone().equals(undefined())) {
            client.setPhone(request.getPhone().orElse(null));
        }
        if (request.getWebsite() != null && !request.getWebsite().equals(undefined())) {
            client.setWebsite(request.getWebsite().orElse(null));
        }
        if (request.getBillingAddress() != null && !request.getBillingAddress().equals(undefined())) {
            client.setBillingAddress(request.getBillingAddress().isPresent() ? request.getBillingAddress().get().toString() : null);
        }
        if (request.getShippingAddress() != null && !request.getShippingAddress().equals(undefined())) {
            client.setShippingAddress(request.getShippingAddress().isPresent() ? request.getShippingAddress().get().toString() : null);
        }
        if (request.getNotes() != null && !request.getNotes().equals(undefined())) {
            client.setNotes(request.getNotes().orElse(null));
        }
        if (request.getExternalAccountingId() != null && !request.getExternalAccountingId().equals(undefined())) {
            client.setExternalAccountingId(request.getExternalAccountingId().orElse(null));
        }
        if (request.getPricingTier() != null && !request.getPricingTier().equals(undefined())) {
            client.setPricingTier(request.getPricingTier().orElse(null));
        }
        if (request.getIsActive() != null && !request.getIsActive().equals(undefined())) {
            client.setIsActive(request.getIsActive().orElse(true));
        }

        // Update tags if provided
        if (request.getTagIds() != null && !request.getTagIds().equals(undefined())) {
            entityTagService.setEntityTags("CLIENT", client.getId(),
                    request.getTagIds().orElse(java.util.List.of()));
        }

        // Update custom field values if provided
        if (request.getCustomFieldValues() != null && !request.getCustomFieldValues().equals(undefined())) {
            var cfValues = request.getCustomFieldValues().orElse(java.util.List.of());
            entityCustomFieldService.setEntityCustomFieldValues(client.getId(),
                    cfValues.stream()
                            .map(v -> new EntityCustomFieldService.CustomFieldValueInput(
                                    v.getCustomFieldId(), v.getValue()))
                            .toList());
        }

        return clientRepository.save(client);
    }

    public void deleteClient(UUID id) {
        if (!clientRepository.existsById(id)) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.client.not.found");
        }
        clientRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<Client> searchClients(SearchClientsRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        Specification<Client> spec = Specification.where(EntityFilterSpecifications.<Client>hasOrganization(orgId))
                .and(EntityFilterSpecifications.textSearch(request.getQuery(), "name", "email"));

        if (request.getType() != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("type"), request.getType()));
        }
        if (request.getIsActive() != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("isActive"), request.getIsActive()));
        }
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            spec = spec.and(EntityFilterSpecifications.hasAnyTag(request.getTagIds(), "CLIENT"));
        }
        if (request.getCustomFieldFilters() != null) {
            for (CustomFieldFilter cf : request.getCustomFieldFilters()) {
                if (cf.getFieldId() == null || cf.getOp() == null) continue;
                CustomFieldDefinition def = customFieldService.getDefinitionById(cf.getFieldId());
                spec = spec.and(EntityFilterSpecifications.customFieldFilter(
                        cf.getFieldId(), def.getFieldType(), cf.getOp().getValue(), cf.getValue()));
            }
        }

        String sortBy = request.getSortBy() != null ? request.getSortBy() : "createdAt";
        String order = request.getOrder() != null ? request.getOrder().getValue() : "desc";
        Pageable pageable = PaginationUtils.getPageable(request.getPage(), request.getSize(), order, sortBy);
        return clientRepository.findAll(spec, pageable);
    }
}
