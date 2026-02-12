package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.LoginRequest;
import org.sharing.carsharing.dto.RegistrationCredentialsRequest;
import org.sharing.carsharing.dto.RegistrationRequest;
import org.sharing.carsharing.dto.UserDto;

public interface AuthService {
    UserDto register(RegistrationRequest registrationRequest);

    UserDto login(LoginRequest loginRequest);
}
