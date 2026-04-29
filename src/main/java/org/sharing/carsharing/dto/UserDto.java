package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.model.enums.ServiceType;

@RequiredArgsConstructor
@Getter
@Setter
public class UserDto {
    private Long userId;
    private String login;
    private String email;
    private String phone;
    private Boolean blocked;
    private Boolean verified;
    private Float rating;
    private Role role;
    private ServiceType serviceType;
    private UserCredentialsDto credentials;
}
