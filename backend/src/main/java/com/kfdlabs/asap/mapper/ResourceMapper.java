package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Resource;
import com.kfdlabs.asap.entity.ResourceAvailability;
import com.kfdlabs.asap.entity.ResourcePayout;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class ResourceMapper {

    @Mapping(target = "userId", source = "user.id")
    public abstract ResourceResponse toDTO(Resource entity);

    @Mapping(target = "resourceId", source = "resource.id")
    public abstract ResourceAvailabilityResponse toAvailabilityDTO(ResourceAvailability entity);

    @Mapping(target = "resourceId", source = "resource.id")
    @Mapping(target = "resourceName", expression = "java(entity.getResource().getFirstName() + \" \" + entity.getResource().getLastName())")
    @Mapping(target = "approvedById", source = "approvedBy.id")
    public abstract ResourcePayoutResponse toPayoutDTO(ResourcePayout entity);

    public PaginatedResourceResponse toPaginatedDTO(Page<Resource> page) {
        PaginatedResourceResponse response = new PaginatedResourceResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }

    public PaginatedResourcePayoutResponse toPaginatedPayoutDTO(Page<ResourcePayout> page) {
        PaginatedResourcePayoutResponse response = new PaginatedResourcePayoutResponse();
        response.setItems(page.getContent().stream().map(this::toPayoutDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
