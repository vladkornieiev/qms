package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.WorkflowRulesApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.WorkflowRuleMapper;
import com.kfdlabs.asap.service.WorkflowRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class WorkflowRuleController implements WorkflowRulesApi {

    private final WorkflowRuleService workflowRuleService;
    private final WorkflowRuleMapper workflowRuleMapper;

    @Override
    public ResponseEntity<PaginatedWorkflowRuleResponse> listWorkflowRules(Integer page, Integer size) {
        return ResponseEntity.ok(workflowRuleMapper.toPaginatedDTO(workflowRuleService.list(page, size)));
    }

    @Override
    public ResponseEntity<WorkflowRuleResponse> getWorkflowRule(UUID id) {
        return ResponseEntity.ok(workflowRuleMapper.toDTO(workflowRuleService.getById(id)));
    }

    @Override
    public ResponseEntity<WorkflowRuleResponse> createWorkflowRule(CreateWorkflowRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workflowRuleMapper.toDTO(workflowRuleService.create(request)));
    }

    @Override
    public ResponseEntity<WorkflowRuleResponse> updateWorkflowRule(UUID id, UpdateWorkflowRuleRequest request) {
        return ResponseEntity.ok(workflowRuleMapper.toDTO(workflowRuleService.update(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteWorkflowRule(UUID id) {
        workflowRuleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<WorkflowRuleResponse> toggleWorkflowRule(UUID id) {
        return ResponseEntity.ok(workflowRuleMapper.toDTO(workflowRuleService.toggle(id)));
    }
}
