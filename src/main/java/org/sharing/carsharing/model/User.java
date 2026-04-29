package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.model.enums.ServiceType;

import java.util.List;

@Entity
@Table(name="users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    private Long userId;

    @Column(name="email")
    private String email;

    @Column(name="phone")
    private String phone;

    @Column(name="login")
    private String login;

    @Column(name="password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name="role")
    private Role role;

    @Column(name="is_blocked")
    private Boolean blocked;

    @Column(name="rating")
    private Float rating;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="cridentials_id", nullable = true)
    private UserCredentials credentials;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Order> orders;

    @Column(name="service_id")
    private Long serviceId;

    @Enumerated(EnumType.STRING)
    @Column(name="service_type")
    private ServiceType serviceType;

    @Column(name="is_verified")
    private Boolean verified;

}
