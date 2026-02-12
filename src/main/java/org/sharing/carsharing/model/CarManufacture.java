package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="car_manufactures")
@RequiredArgsConstructor
@Getter
@Setter
public class CarManufacture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="manufactyre_id")
    private Long modelId;

    @Column(name="name")
    private String name;

    @Column(name = "country")
    private String country;

    @Column(name="badge_url")
    private String badgeUrl;

    @OneToMany(mappedBy = "carManufacture",cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<CarModel> carModels = new ArrayList<>();
}
