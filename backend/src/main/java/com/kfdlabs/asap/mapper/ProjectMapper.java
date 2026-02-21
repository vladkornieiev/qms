package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Project;
import com.kfdlabs.asap.entity.ProjectDateRange;
import com.kfdlabs.asap.entity.ProjectProduct;
import com.kfdlabs.asap.entity.ProjectResource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ProjectMapper {

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", expression = "java(entity.getClient() != null ? entity.getClient().getName() : null)")
    @Mapping(target = "createdById", source = "createdBy.id")
    public abstract ProjectResponse toDTO(Project entity);

    @Mapping(target = "projectId", source = "project.id")
    public abstract ProjectDateRangeResponse toDateRangeDTO(ProjectDateRange entity);

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "resourceId", source = "resource.id")
    @Mapping(target = "resourceName", expression = "java(entity.getResource().getFirstName() + \" \" + entity.getResource().getLastName())")
    public abstract ProjectResourceResponse toResourceDTO(ProjectResource entity);

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", expression = "java(entity.getProduct().getName())")
    @Mapping(target = "inventoryItemId", source = "inventoryItem.id")
    @Mapping(target = "vendorId", source = "vendor.id")
    @Mapping(target = "vendorName", expression = "java(entity.getVendor() != null ? entity.getVendor().getName() : null)")
    public abstract ProjectProductResponse toProductDTO(ProjectProduct entity);

    public ProjectDetailResponse toDetailDTO(Project entity,
                                              List<ProjectDateRange> dateRanges,
                                              List<ProjectResource> resources,
                                              List<ProjectProduct> products) {
        ProjectDetailResponse response = new ProjectDetailResponse();
        response.setId(entity.getId());
        response.setClientId(entity.getClient() != null ? entity.getClient().getId() : null);
        response.setClientName(entity.getClient() != null ? entity.getClient().getName() : null);
        response.setProjectNumber(entity.getProjectNumber());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());
        response.setPriority(entity.getPriority());
        response.setVenueName(entity.getVenueName());
        response.setLocation(entity.getLocation());
        response.setOnsiteContact(entity.getOnsiteContact());
        response.setTotalBillable(entity.getTotalBillable());
        response.setTotalCost(entity.getTotalCost());
        response.setTotalProfit(entity.getTotalProfit());
        response.setExternalAccountingId(entity.getExternalAccountingId());
        response.setSource(entity.getSource());
        response.setInboundRequestId(entity.getInboundRequestId());
        response.setCustomFields(entity.getCustomFields());
        response.setCreatedById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null);
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setDateRanges(dateRanges.stream().map(this::toDateRangeDTO).toList());
        response.setResources(resources.stream().map(this::toResourceDTO).toList());
        response.setProducts(products.stream().map(this::toProductDTO).toList());
        return response;
    }

    public PaginatedProjectResponse toPaginatedDTO(Page<Project> page) {
        PaginatedProjectResponse response = new PaginatedProjectResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
