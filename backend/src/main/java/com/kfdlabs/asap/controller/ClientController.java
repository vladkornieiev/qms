package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ClientsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.ClientMapper;
import com.kfdlabs.asap.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ClientController implements ClientsApi {

    private final ClientService clientService;
    private final ClientMapper clientMapper;

    @Override
    public ResponseEntity<PaginatedClientResponse> searchClients(SearchClientsRequest request) {
        return ResponseEntity.ok(clientMapper.toPaginatedResponse(clientService.searchClients(request)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<ClientResponse> createClient(CreateClientRequest request) {
        return ResponseEntity.status(201).body(clientMapper.toClientResponse(clientService.createClient(request)));
    }

    @Override
    public ResponseEntity<ClientResponse> getClient(UUID id) {
        return ResponseEntity.ok(clientMapper.toClientResponse(clientService.getClientById(id)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<ClientResponse> updateClient(UUID id, UpdateClientRequest request) {
        return ResponseEntity.ok(clientMapper.toClientResponse(clientService.updateClient(id, request)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteClient(UUID id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
