package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.LookupListDetailResponse;
import com.kfdlabs.asap.dto.LookupListItemResponse;
import com.kfdlabs.asap.dto.LookupListResponse;
import com.kfdlabs.asap.entity.LookupList;
import com.kfdlabs.asap.entity.LookupListItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class LookupListMapper {

    public abstract LookupListResponse toDTO(LookupList entity);

    @Mapping(target = "parentId", source = "parent.id")
    public abstract LookupListItemResponse toItemDTO(LookupListItem entity);

    public LookupListDetailResponse toDetailDTO(LookupList entity, List<LookupListItem> items) {
        LookupListDetailResponse response = new LookupListDetailResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setSlug(entity.getSlug());
        response.setDescription(entity.getDescription());
        response.setIsSystem(entity.getIsSystem());
        response.setIsActive(entity.getIsActive());
        response.setItems(items.stream().map(this::toItemDTO).toList());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
