package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@Getter
@Setter
public class UserCredentialsAddRequest {
    private String firstName;
    private String lastName;
    private String passportNumber;
    private LocalDateTime birthDate;
    private String driverLicence;
    private LocalDateTime verificationDate;
}
