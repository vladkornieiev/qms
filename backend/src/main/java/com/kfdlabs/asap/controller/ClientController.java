package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ClientsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.ClientMapper;
import com.kfdlabs.asap.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ClientController implements ClientsApi {

    private final ClientService clientService;
    private final ClientMapper clientMapper;

    @Override
    public ResponseEntity<PaginatedClientResponse> listClients(
            String query, String type, Boolean isActive,
            Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(clientMapper.toPaginatedDTO(
                clientService.listClients(query, type, isActive, page, size, sortBy, order)));
    }

    @Override
    public ResponseEntity<ClientResponse> getClientById(UUID id) {
        return ResponseEntity.ok(clientMapper.toDTO(clientService.getClient(id)));
    }

    @Override
    public ResponseEntity<ClientResponse> createClient(CreateClientRequest request) {
        return ResponseEntity.status(201).body(clientMapper.toDTO(clientService.createClient(request)));
    }

    @Override
    public ResponseEntity<ClientResponse> updateClient(UUID id, UpdateClientRequest request) {
        return ResponseEntity.ok(clientMapper.toDTO(clientService.updateClient(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteClient(UUID id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<ClientContactResponse>> listClientContacts(UUID id) {
        return ResponseEntity.ok(clientService.listContacts(id).stream()
                .map(clientMapper::toContactDTO).toList());
    }

    @Override
    public ResponseEntity<ClientContactResponse> createClientContact(UUID id, CreateClientContactRequest request) {
        return ResponseEntity.status(201).body(clientMapper.toContactDTO(
                clientService.createContact(id, request)));
    }

    @Override
    public ResponseEntity<ClientContactResponse> updateClientContact(UUID id, UUID contactId, UpdateClientContactRequest request) {
        return ResponseEntity.ok(clientMapper.toContactDTO(
                clientService.updateContact(id, contactId, request)));
    }

    @Override
    public ResponseEntity<Void> deleteClientContact(UUID id, UUID contactId) {
        clientService.deleteContact(id, contactId);
        return ResponseEntity.noContent().build();
    }
}
