package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.BodyType;
import org.sharing.carsharing.model.enums.Transmission;

import java.util.ArrayList;
import java.util.List;

@Entity
@RequiredArgsConstructor
@Setter
@Getter
@Table(name="car_models")
public class CarModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="model_id")
    private Long modelId;

    @Column(name="name")
    private String name;

    @Column(name="seats")
    private Integer seats;

    @Enumerated(EnumType.STRING)
    @Column(name="transmission")
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    @Column(name="body_type")
    private BodyType bodyType;

    @OneToMany(mappedBy ="carModel",cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Car> cars=new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="manufacture_id", nullable = false)
    private CarManufacture carManufacture;

    @Column(name="coefficient")
    private Float coefficient;
}
