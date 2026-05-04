package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.*;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final AdminAccessService adminAccessService;

    @PutMapping("/updateUser/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest userUpdateRequest) {
        return ResponseEntity.ok(userService.updateUser(id, userUpdateRequest));
    }

    @GetMapping("/getAllUserData/{id}")
    public ResponseEntity<UserDto> getAllUserData(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getAllUserData(id));
    }

    @PutMapping("/blockUser/{id}")
    public ResponseEntity<UserDto> blockUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.blockUser(id));
    }

    @PutMapping("/setUserRole/{id}")
    public ResponseEntity<UserDto> setUserRole(
            @PathVariable Long id,
            @RequestBody UserRoleRequest userRoleRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.SISADMIN);
        return ResponseEntity.ok(userService.setUserRole(id, userRoleRequest));
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/changeRating/{id}")
    public ResponseEntity<UserDto> changeRating(@PathVariable Long id, UserRatingEditRequest userRatingEditRequest) {
        return ResponseEntity.ok(userService.changeRating(id, userRatingEditRequest));
    }

    @PostMapping("/addCredentials/{id}")
    public ResponseEntity<UserCredentialsDto> addCredentials(@PathVariable Long id, @RequestBody UserCredentialsAddRequest userCredentialsAddRequest) {
        return ResponseEntity.ok(userService.addCredentials(id, userCredentialsAddRequest));
    }

    @PutMapping("/verifyUser/{id}")
    public ResponseEntity<UserDto> verifyUser(
            @PathVariable Long id,
            @RequestBody UserVerificationRequest verificationRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN);
        return ResponseEntity.ok(userService.verifyUser(id, verificationRequest));
    }
}