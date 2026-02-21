package com.kfdlabs.asap.mapper;

import com.kfdlabs.asap.entity.UserEmailPreferences;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserEmailPreferencesMapper {

    com.kfdlabs.asap.dto.UserEmailPreferences toDto(UserEmailPreferences entity);

}




