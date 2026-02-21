package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.dto.FileAttachmentResponse;
import com.kfdlabs.asap.entity.FileAttachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class FileAttachmentMapper {

    @Mapping(target = "uploadedById", source = "uploadedBy.id")
    public abstract FileAttachmentResponse toDTO(FileAttachment entity);
}
