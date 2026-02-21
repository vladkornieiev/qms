package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.entity.UserAuthMethods;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public abstract class UserAuthMethodsMapper {

    public abstract com.kfdlabs.asap.dto.UserAuthMethods toDto(UserAuthMethods entity);
}

