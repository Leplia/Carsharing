package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@RequiredArgsConstructor
@Setter
@Getter
@Table(name="parking_spots")
public class ParkingSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="parking_spot_id")
    private Long parkingSpotId;

    @Column(name="pos_x_f")
    private Float posXF;

    @Column(name="pos_y_f")
    private Float posYF;

    @Column(name="pos_x_s")
    private Float posXS;

    @Column(name="pos_y_s")
    private Float posYS;

    @Column(name="addres")
    private String address;
}
