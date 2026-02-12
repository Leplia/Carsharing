package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.LoginRequest;
import org.sharing.carsharing.dto.RegistrationRequest;
import org.sharing.carsharing.dto.UserDto;
import org.sharing.carsharing.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody RegistrationRequest registrationRequest){
        UserDto userDto=authService.register(registrationRequest);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody LoginRequest loginRequest){
        UserDto userDto=authService.login(loginRequest);
        return ResponseEntity.ok(userDto);
    }
}
