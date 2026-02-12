package org.sharing.carsharing.dto;

import jdk.jfr.Unsigned;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.Role;

@RequiredArgsConstructor
@Getter
@Setter
public class UserDto {
    private String login;
    private String email;
    private String phone;
    private Boolean blocked;
    private Float rating;
    private Role role;
    private UserCredentialsDto credentials;
}
