package org.sharing.carsharing.mapper.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.UserDto;
import org.sharing.carsharing.model.User;

@Mapper(componentModel = "spring", uses = UserCredentialsMapper.class)
public interface UserMapper {
    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "credentials", target = "credentials")
    UserDto toDto(User user);
}
