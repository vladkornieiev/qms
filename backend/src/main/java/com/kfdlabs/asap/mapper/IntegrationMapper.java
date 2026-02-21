package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Integration;
import com.kfdlabs.asap.entity.IntegrationSyncLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class IntegrationMapper {

    public abstract IntegrationResponse toDTO(Integration entity);

    @Mapping(target = "integrationId", source = "integration.id")
    public abstract SyncLogResponse toSyncLogDTO(IntegrationSyncLog entity);

    public PaginatedSyncLogResponse toPaginatedSyncLogDTO(Page<IntegrationSyncLog> page) {
        PaginatedSyncLogResponse response = new PaginatedSyncLogResponse();
        response.setItems(page.getContent().stream().map(this::toSyncLogDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
