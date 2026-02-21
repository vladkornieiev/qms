package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.PaginatedVendorResponse;
import com.kfdlabs.asap.dto.VendorContactResponse;
import com.kfdlabs.asap.dto.VendorResponse;
import com.kfdlabs.asap.entity.Vendor;
import com.kfdlabs.asap.entity.VendorContact;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public abstract class VendorMapper {

    public abstract VendorResponse toDTO(Vendor entity);

    @Mapping(target = "vendorId", source = "vendor.id")
    public abstract VendorContactResponse toContactDTO(VendorContact entity);

    public PaginatedVendorResponse toPaginatedDTO(Page<Vendor> page) {
        PaginatedVendorResponse response = new PaginatedVendorResponse();
        response.setItems(page.getContent().stream().map(this::toDTO).toList());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        return response;
    }
}
