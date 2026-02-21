package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.WorkflowRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class WorkflowRuleMapper {

    @Mapping(target = "createdById", source = "createdBy.id")
    public abstract WorkflowRuleResponse toDTO(WorkflowRule entity);

    public PaginatedWorkflowRuleResponse toPaginatedDTO(Page<WorkflowRule> page) {
        PaginatedWorkflowRuleResponse response = new PaginatedWorkflowRuleResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
