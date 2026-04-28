package org.sharing.carsharing.repository;

import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phoneNumber);

    boolean existsByLogin(String login);

    Optional<User> findByEmail(String logmail);

    Optional<User> findByLogin(String logmail);

    Optional<User> findByServiceTypeAndServiceId(ServiceType serviceType, Long serviceId);
}
