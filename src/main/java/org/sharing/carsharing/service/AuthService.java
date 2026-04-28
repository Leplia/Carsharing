package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.LoginRequest;
import org.sharing.carsharing.dto.AuthResponse;
import org.sharing.carsharing.dto.RegistrationRequest;
import org.sharing.carsharing.dto.UserDto;

public interface AuthService {
    AuthResponse register(RegistrationRequest registrationRequest);

    AuthResponse login(LoginRequest loginRequest);

    UserDto getCurrentUser(String bearerToken);
}
