package org.sharing.carsharing.mapper.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.RegistrationCredentialsRequest;
import org.sharing.carsharing.dto.UserCredentialsDto;
import org.sharing.carsharing.model.UserCredentials;

@Mapper(componentModel = "spring")
public interface UserCredentialsMapper {
    @Mapping(source = "driverLicence", target = "driverLicense")
    UserCredentialsDto toDto(UserCredentials userCredentials);
    UserCredentials toEntity(RegistrationCredentialsRequest userCredentialsDto);
}
