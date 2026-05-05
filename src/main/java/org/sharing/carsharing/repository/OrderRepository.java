package org.sharing.carsharing.repository;

import org.sharing.carsharing.model.Order;
import org.sharing.carsharing.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByUserUserIdAndStatus(Long userId, OrderStatus status);
    List<Order> findByUserUserIdOrderByStartTimeDesc(Long userId);
}