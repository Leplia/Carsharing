package org.sharing.carsharing.dto.carDto.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.CarModel;

@RequiredArgsConstructor
@Getter
@Setter
public class CarAddRequest {
    private Long carId;
    private String vinNumber;
    private String color;
    private Integer year;
    private Double locationX;
    private Double locationY;
    private String description;
    private String photoUrl;
    private CarModel carModel;
}
