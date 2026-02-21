package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateWorkflowRuleRequest;
import com.kfdlabs.asap.dto.UpdateWorkflowRuleRequest;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.WorkflowRule;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.repository.WorkflowRuleRepository;
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
public class WorkflowRuleService {

    private final WorkflowRuleRepository workflowRuleRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public Page<WorkflowRule> list(Integer page, Integer size) {
        return workflowRuleRepository.findAll(SecurityUtils.getCurrentOrganizationId(), PaginationUtils.getPageable(page, size));
    }

    public WorkflowRule getById(UUID id) {
        WorkflowRule rule = workflowRuleRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Workflow rule not found"));
        if (!rule.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return rule;
    }

    @SuppressWarnings("unchecked")
    public WorkflowRule create(CreateWorkflowRuleRequest request) {
        Organization org = organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
        WorkflowRule rule = new WorkflowRule();
        rule.setOrganization(org);
        rule.setName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        rule.setTriggerEntity(request.getTriggerEntity());
        rule.setTriggerEvent(request.getTriggerEvent());
        rule.setTriggerConditions(request.getTriggerConditions() != null ? (Map<String, Object>) request.getTriggerConditions() : Map.of());
        rule.setActions(request.getActions() != null ? request.getActions().stream().map(a -> (Map<String, Object>) a).toList() : List.of());
        rule.setExecutionOrder(request.getExecutionOrder() != null ? request.getExecutionOrder() : 0);
        rule.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return workflowRuleRepository.save(rule);
    }

    @SuppressWarnings("unchecked")
    public WorkflowRule update(UUID id, UpdateWorkflowRuleRequest request) {
        WorkflowRule rule = getById(id);
        if (request.getName() != null) rule.setName(request.getName());
        if (request.getDescription() != null) rule.setDescription(request.getDescription());
        if (request.getIsActive() != null) rule.setIsActive(request.getIsActive());
        if (request.getTriggerEntity() != null) rule.setTriggerEntity(request.getTriggerEntity());
        if (request.getTriggerEvent() != null) rule.setTriggerEvent(request.getTriggerEvent());
        if (request.getTriggerConditions() != null) rule.setTriggerConditions((Map<String, Object>) request.getTriggerConditions());
        if (request.getActions() != null && !request.getActions().isEmpty()) {
            rule.setActions(request.getActions().stream().map(a -> (Map<String, Object>) a).toList());
        }
        if (request.getExecutionOrder() != null) rule.setExecutionOrder(request.getExecutionOrder());
        return workflowRuleRepository.save(rule);
    }

    public void delete(UUID id) {
        WorkflowRule rule = getById(id);
        workflowRuleRepository.delete(rule);
    }

    public WorkflowRule toggle(UUID id) {
        WorkflowRule rule = getById(id);
        rule.setIsActive(!rule.getIsActive());
        return workflowRuleRepository.save(rule);
    }

    public List<WorkflowRule> findActiveByTrigger(String triggerEntity, String triggerEvent) {
        return workflowRuleRepository.findActiveByTrigger(SecurityUtils.getCurrentOrganizationId(), triggerEntity, triggerEvent);
    }
}
