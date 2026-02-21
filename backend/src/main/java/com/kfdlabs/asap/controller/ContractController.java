package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ContractsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.ContractMapper;
import com.kfdlabs.asap.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ContractController implements ContractsApi {

    private final ContractService contractService;
    private final ContractMapper contractMapper;

    @Override
    public ResponseEntity<PaginatedContractResponse> listContracts(
            String query, String status, String contractType, UUID clientId, UUID projectId,
            Integer page, Integer size) {
        return ResponseEntity.ok(contractMapper.toPaginatedDTO(
                contractService.list(query, status, contractType, clientId, projectId, page, size)));
    }

    @Override
    public ResponseEntity<ContractResponse> getContractById(UUID id) {
        return ResponseEntity.ok(contractMapper.toDTO(contractService.get(id)));
    }

    @Override
    public ResponseEntity<ContractResponse> createContract(CreateContractRequest createContractRequest) {
        return ResponseEntity.status(201).body(contractMapper.toDTO(contractService.create(createContractRequest)));
    }

    @Override
    public ResponseEntity<ContractResponse> updateContract(UUID id, UpdateContractRequest updateContractRequest) {
        return ResponseEntity.ok(contractMapper.toDTO(contractService.update(id, updateContractRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteContract(UUID id) {
        contractService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ContractResponse> sendContract(UUID id) {
        return ResponseEntity.ok(contractMapper.toDTO(contractService.send(id)));
    }

    @Override
    public ResponseEntity<ContractResponse> signContract(UUID id, ContractSignRequest contractSignRequest) {
        return ResponseEntity.ok(contractMapper.toDTO(contractService.sign(id, contractSignRequest)));
    }
}
