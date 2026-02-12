package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Setter
@Getter
public class UserUpdateRequest {
    private String email;
    private String phone;
    private String login;
    private String password;
    private UserCredentialUpdateRequest userCredentialUpdateRequest;
}
