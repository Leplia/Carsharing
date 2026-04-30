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
import java.util.Optional;

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

        if (userUpdateRequest.getUserCredentialUpdateRequest() != null) {
            Optional<UserCredentials> userCredentialsOptional = Optional.ofNullable(user.getCredentials());
            if (userCredentialsOptional.isPresent()) {
                UserCredentials userCredentials = userCredentialsOptional.get();
                if (userUpdateRequest.getUserCredentialUpdateRequest().getFirstName() != null) {
                    userCredentials.setFirstName(userUpdateRequest.getUserCredentialUpdateRequest().getFirstName());
                }
                if (userUpdateRequest.getUserCredentialUpdateRequest().getLastName() != null) {
                    userCredentials.setLastName(userUpdateRequest.getUserCredentialUpdateRequest().getLastName());
                }
                userCredentialsRepository.save(userCredentials);
                user.setCredentials(userCredentials);
            }
        }

        if (userUpdateRequest.getPassword() != null && !userUpdateRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userUpdateRequest.getPassword()));
        }
        if (userUpdateRequest.getEmail() != null) {
            user.setEmail(userUpdateRequest.getEmail());
        }
        if (userUpdateRequest.getLogin() != null) {
            user.setLogin(userUpdateRequest.getLogin());
        }
        if (userUpdateRequest.getPhone() != null) {
            user.setPhone(userUpdateRequest.getPhone());
        }

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
        if (userRoleRequest == null || userRoleRequest.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }
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
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("user not found"));
        UserCredentials credentials = Optional.ofNullable(user.getCredentials()).orElseGet(UserCredentials::new);
        credentials.setFirstName(userCredentialsAddRequest.getFirstName());
        credentials.setLastName(userCredentialsAddRequest.getLastName());
        credentials.setPassportNumber(userCredentialsAddRequest.getPassportNumber());
        credentials.setBirthDate(userCredentialsAddRequest.getBirthDate());
        credentials.setDriverLicence(userCredentialsAddRequest.getDriverLicence());
        credentials.setVerificationDate(userCredentialsAddRequest.getVerificationDate());
        credentials.setVerified(false);
        UserCredentials savedCredentials = userCredentialsRepository.save(credentials);
        user.setCredentials(savedCredentials);
        user.setVerified(false);
        userRepository.save(user);
        return userCredentialsMapper.toDto(savedCredentials);
    }

    @Override
    public UserDto verifyUser(Long id, UserVerificationRequest verificationRequest) {
        if (verificationRequest == null || verificationRequest.getVerified() == null) {
            throw new IllegalArgumentException("Verified flag is required");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (Boolean.TRUE.equals(verificationRequest.getVerified())) {
            user.setVerified(true);
            if (user.getCredentials() != null) {
                user.getCredentials().setVerified(true);
                userCredentialsRepository.save(user.getCredentials());
            }
        } else {
            user.setVerified(false);
            UserCredentials credentials = user.getCredentials();
            if (credentials != null) {
                user.setCredentials(null);
                userRepository.save(user);
                userCredentialsRepository.delete(credentials);
                return userMapper.toDto(user);
            }
        }
        return userMapper.toDto(userRepository.save(user));
    }
}
