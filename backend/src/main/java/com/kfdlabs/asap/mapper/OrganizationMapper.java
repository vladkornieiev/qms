package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedOrganizationResponse;
import com.kfdlabs.asap.entity.Organization;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class OrganizationMapper {

    public abstract com.kfdlabs.asap.dto.Organization toDTO(Organization entity);

    public PaginatedOrganizationResponse toPaginatedDTO(Page<Organization> orgs) {
        PaginatedOrganizationResponse response = new PaginatedOrganizationResponse();
        response.setItems(orgs.getContent().stream().map(this::toDTO).toList());
        response.setPage(orgs.getNumber());
        response.setSize(orgs.getSize());
        response.setTotalElements(orgs.getTotalElements());
        response.setTotalPages(orgs.getTotalPages());
        return response;
    }
}
