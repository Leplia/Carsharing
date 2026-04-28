package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name="user_credentials")
@Builder
public class UserCredentials {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="credentials_id")
    private Long credentialsId;

    @Column(name="first_name")
    private String firstName;

    @Column(name="last_name")
    private String lastName;

    @Column(name="passport_number")
    private String passportNumber;

    @Column(name="birth_date")
    private LocalDateTime birthDate;

    @Column(name="driver_licence")
    private String driverLicence;

    @Column(name="verification_date")
    private LocalDateTime verificationDate;

    @OneToOne(mappedBy = "credentials",cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private User user;
}
