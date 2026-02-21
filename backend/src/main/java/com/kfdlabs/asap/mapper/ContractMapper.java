package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Contract;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class ContractMapper {

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", expression = "java(entity.getClient() != null ? entity.getClient().getName() : null)")
    @Mapping(target = "resourceId", source = "resource.id")
    @Mapping(target = "vendorId", source = "vendor.id")
    public abstract ContractResponse toDTO(Contract entity);

    public PaginatedContractResponse toPaginatedDTO(Page<Contract> page) {
        PaginatedContractResponse response = new PaginatedContractResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
