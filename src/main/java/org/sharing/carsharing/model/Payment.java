package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@Table(name="payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="payment_id")
    private Long paymentId;

    @Column(name="cheque")
    private String cheque;

    @OneToOne(mappedBy = "payment", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Order order;

    @Column(name="price")
    private Double price;
}