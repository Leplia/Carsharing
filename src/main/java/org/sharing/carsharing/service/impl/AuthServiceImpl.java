package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.AuthResponse;
import org.sharing.carsharing.dto.LoginRequest;
import org.sharing.carsharing.dto.RegistrationRequest;
import org.sharing.carsharing.dto.UserDto;
import org.sharing.carsharing.mapper.user.UserCredentialsMapper;
import org.sharing.carsharing.mapper.user.UserMapper;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.model.enums.ServiceType;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.service.AuthService;
import org.sharing.carsharing.util.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserCredentialsMapper userCredentialsMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponse register(RegistrationRequest registrationRequest) {
        ServiceType serviceType = registrationRequest.getServiceType();
        if (serviceType == null) {
            throw new RuntimeException("Не указан тип регистрации");
        }
        if (serviceType != ServiceType.LOCAL) {
            throw new RuntimeException("Регистрация через эту форму доступна только для LOCAL");
        }
        if(userRepository.existsByEmail(registrationRequest.getEmail())){
            throw new RuntimeException("Емэйл");
        }
        if(userRepository.existsByPhone(registrationRequest.getPhoneNumber())){
            throw new RuntimeException("Телефон");
        }
        if(userRepository.existsByLogin(registrationRequest.getLogin())){
            throw new RuntimeException("логин");
        }
        User user = new User();
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setPhone(registrationRequest.getPhoneNumber());
        user.setLogin(registrationRequest.getLogin());
        user.setRole(Role.USER);
        user.setBlocked(false);
        user.setRating(5F);
        user.setCredentials(null);
        user.setServiceType(ServiceType.LOCAL);
        user.setServiceId(null);
        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getLogin(), savedUser.getUserId());
        return new AuthResponse(userMapper.toDto(savedUser), token);
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        ServiceType serviceType = loginRequest.getServiceType();
        if (serviceType == null) {
            throw new RuntimeException("Не указан тип авторизации");
        }
        User user;
        if (loginRequest.getLogmail().contains("@")) {
            user = userRepository.findByEmail(loginRequest.getLogmail())
                    .orElseThrow(() -> new RuntimeException("Пользователь с таким email не найден"));
        }
        else {
            user = userRepository.findByLogin(loginRequest.getLogmail())
                    .orElseThrow(() -> new RuntimeException("Пользователь с таким логином не найден"));
        }
        if (serviceType != ServiceType.LOCAL) {
            throw new RuntimeException("Через этот endpoint поддерживается только LOCAL вход");
        }
        if (user.getServiceType() == ServiceType.GITHUB) {
            throw new RuntimeException("Этот аккаунт зарегистрирован через GitHub");
        }
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Неверный пароль");
        }
        String token = jwtTokenProvider.generateToken(user.getLogin(), user.getUserId());
        return new AuthResponse(userMapper.toDto(user), token);
    }

    @Override
    public UserDto getCurrentUser(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new RuntimeException("Требуется Authorization Bearer token");
        }
        String token = bearerToken.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Некорректный токен");
        }
        String login = jwtTokenProvider.getUsername(token);
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return userMapper.toDto(user);
    }
}
