package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.LoginRequest;
import org.sharing.carsharing.dto.RegistrationRequest;
import org.sharing.carsharing.dto.UserDto;
import org.sharing.carsharing.mapper.user.UserCredentialsMapper;
import org.sharing.carsharing.mapper.user.UserMapper;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserCredentialsMapper userCredentialsMapper;

    @Override
    public UserDto register(RegistrationRequest registrationRequest) {
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

        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public UserDto login(LoginRequest loginRequest) {
        if (!userRepository.existsByEmail(loginRequest.getLogmail())){
            throw new RuntimeException("Email");
        }
        if(!userRepository.existsByLogin(loginRequest.getLogmail())){
            throw new RuntimeException("Логин");
        }
        User user=new User();
        if (loginRequest.getLogmail().contains("@")){
            user=userRepository.findByEmail(loginRequest.getLogmail()).orElseThrow(()->new RuntimeException("ошибка получения емайла"));
        }
        else {
            user=userRepository.findByLogin(loginRequest.getLogmail()).orElseThrow(()->new RuntimeException("ошибка получения логина"));
        }
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new RuntimeException("paroli");
        }
        return userMapper.toDto(user);
    }
}
