package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.*;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PutMapping("/updateUser/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest userUpdateRequest) {
        UserDto userDto=userService.updateUser(id, userUpdateRequest);
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/getAllUserData/{id}")
    public ResponseEntity<UserDto> getAllUserData(@PathVariable Long id) {
        UserDto userDto=userService.getAllUserData(id);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/blockUser/{id}")
    public ResponseEntity<UserDto> blockUser(@PathVariable Long id) {
        UserDto userDto=userService.blockUser(id);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/setUserRole/{id}")
    public ResponseEntity<UserDto> setUserRole(@PathVariable Long id, @RequestBody UserRoleRequest userRoleRequest) {
        UserDto userDto=userService.setUserRole(id, userRoleRequest);
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users=userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/changeRating/{id}")
    public ResponseEntity<UserDto> changeRating(@PathVariable Long id, UserRatingEditRequest userRatingEditRequest) {
        UserDto userDto=userService.changeRating(id, userRatingEditRequest);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/addCredentials/{id}")
    public ResponseEntity<UserCredentialsDto> addCredentials(@PathVariable Long id, @RequestBody UserCredentialsAddRequest userCredentialsAddRequest) {
        UserCredentialsDto userCredentialsDto=userService.addCredentials(id,userCredentialsAddRequest);
        return ResponseEntity.ok(userCredentialsDto);
    }

}
