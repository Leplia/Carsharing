package org.sharing.carsharing.mapper.user;

import org.mapstruct.Mapper;
import org.sharing.carsharing.dto.RegistrationCredentialsRequest;
import org.sharing.carsharing.dto.UserCredentialsDto;
import org.sharing.carsharing.model.UserCredentials;

@Mapper(componentModel = "spring")
public interface UserCredentialsMapper {
    UserCredentialsDto toDto(UserCredentials userCredentials);
    UserCredentials toEntity(RegistrationCredentialsRequest userCredentialsDto);
}
