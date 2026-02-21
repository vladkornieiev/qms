package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.ClientContactResponse;
import com.kfdlabs.asap.dto.ClientResponse;
import com.kfdlabs.asap.dto.PaginatedClientResponse;
import com.kfdlabs.asap.entity.Client;
import com.kfdlabs.asap.entity.ClientContact;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class ClientMapper {

    public abstract ClientResponse toDTO(Client entity);

    @Mapping(target = "clientId", source = "client.id")
    public abstract ClientContactResponse toContactDTO(ClientContact entity);

    public PaginatedClientResponse toPaginatedDTO(Page<Client> page) {
        PaginatedClientResponse response = new PaginatedClientResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
