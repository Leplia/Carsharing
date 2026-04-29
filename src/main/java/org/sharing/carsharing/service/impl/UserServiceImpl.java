package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.*;
import org.sharing.carsharing.mapper.user.UserCredentialsMapper;
import org.sharing.carsharing.mapper.user.UserMapper;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.UserCredentials;
import org.sharing.carsharing.repository.UserCredentialsRepository;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserCredentialsRepository userCredentialsRepository;
    private final UserCredentialsMapper userCredentialsMapper;

    @Override
    public UserDto updateUser(Long id,UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(()->new RuntimeException("User not found"));
        UserCredentials userCredentials= userCredentialsRepository.findById(id)
                .orElseThrow(()->new RuntimeException("user credentials not found"));
        userCredentials.setFirstName(userUpdateRequest.getUserCredentialUpdateRequest().getFirstName());
        userCredentials.setLastName(userUpdateRequest.getUserCredentialUpdateRequest().getLastName());
        user.setPassword(passwordEncoder.encode(userUpdateRequest.getPassword()));
        user.setCredentials(userCredentials);
        user.setEmail(userUpdateRequest.getEmail());
        user.setLogin(userUpdateRequest.getLogin());
        user.setPhone(userUpdateRequest.getPhone());

        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public UserDto getAllUserData(Long id){
        return userMapper.toDto(userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found")));
    }

    @Override
    public UserDto blockUser(Long id){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found"));
        user.setBlocked(!user.getBlocked());
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public UserDto setUserRole(Long id, UserRoleRequest userRoleRequest){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found"));
        user.setRole(userRoleRequest.getRole());
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public List<UserDto> getAllUsers(){
        List<User> users = userRepository.findAll();
        return users.stream().map(userMapper::toDto).toList();
    }

    @Override
    public UserDto changeRating(Long id, UserRatingEditRequest userRatingEditRequest){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found"));
        user.setRating(user.getRating()+userRatingEditRequest.getRatingEdit());
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public UserCredentialsDto addCredentials(Long id, UserCredentialsAddRequest userCredentialsAddRequest){
        return userCredentialsMapper.toDto(userCredentialsRepository.save(UserCredentials.builder()
                .firstName(userCredentialsAddRequest.getFirstName())
                .lastName(userCredentialsAddRequest.getLastName())
                .passportNumber(userCredentialsAddRequest.getPassportNumber())
                .birthDate(userCredentialsAddRequest.getBirthDate())
                .driverLicence(userCredentialsAddRequest.getDriverLicence())
                .verificationDate(userCredentialsAddRequest.getVerificationDate())
                .user(userRepository.findById(id).orElseThrow(()->new RuntimeException("user not found")))
                .build()));
    }

    @Override
    public UserDto verifyUser(Long id, UserVerificationRequest verificationRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(verificationRequest.getVerified());
        return userMapper.toDto(userRepository.save(user));
    }
}
