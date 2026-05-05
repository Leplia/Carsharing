package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;
import org.sharing.carsharing.model.enums.OrderStatus;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name="orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="car_id",nullable = false)
    private Car car;

    @Enumerated(EnumType.STRING)
    @Column(name="status")
    private OrderStatus status;

    @Column(name="distance")
    private Double distance;

    @Column(name="spend_fuel")
    private Double spendFuel;

    @Column(name = "price")
    private Double price;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name="payment_id", nullable = false)
    private Payment payment;

    @Column(name="rating_edits")
    private Float ratingEdits;
}
