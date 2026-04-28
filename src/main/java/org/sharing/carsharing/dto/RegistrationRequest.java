package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.ServiceType;

@NoArgsConstructor
@Getter
@Setter
public class RegistrationRequest {
    private String login;
    private String password;
    private String email;
    private String phoneNumber;
    private ServiceType serviceType;
}
