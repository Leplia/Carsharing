package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Getter
@Setter
public class RegistrationCredentialsRequest {
    private String firstName;
    private String lastName;
    private String passportNumber;
    private String driverLicense;
    private LocalDateTime verificationDate;
    private LocalDateTime birthDate;
}
