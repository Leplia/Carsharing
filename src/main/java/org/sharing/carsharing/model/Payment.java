package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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