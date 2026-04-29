package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;
import org.sharing.carsharing.model.enums.CarStatus;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name="cars")
@AllArgsConstructor
@NoArgsConstructor
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="car_id")
    private Long carId;

    @Column(name="vin_number")
    private String vinNumber;

    @Column(name="color")
    private String color;

    @Column(name="year")
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(name="status")
    private CarStatus carStatus;

    @Column(name="fuel_level")
    private Integer fuelLevel;

    @Column(name="location_x")
    private Double locationX;

    @Column(name="location_y")
    private Double locationY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="model_id", nullable=false)
    private CarModel carModel;

    @Column(name="description")
    private String description;

    @Column(name="photo_url")
    private String photoUrl;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarPhoto> photos;
}
