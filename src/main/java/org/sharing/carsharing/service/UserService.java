package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.*;

import java.util.List;

public interface UserService {
    UserDto updateUser(Long id,UserUpdateRequest userUpdateRequest);

    UserDto getAllUserData(Long id);

    UserDto blockUser(Long id);

    UserDto setUserRole(Long id, UserRoleRequest userRoleRequest);

    List<UserDto> getAllUsers();

    UserDto changeRating(Long id, UserRatingEditRequest userRatingEditRequest);

    UserCredentialsDto addCredentials(Long id, UserCredentialsAddRequest userCredentialsAddRequest);
    
    UserDto verifyUser(Long id, UserVerificationRequest verificationRequest);
}
