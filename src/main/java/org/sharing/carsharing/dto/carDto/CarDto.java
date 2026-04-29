package org.sharing.carsharing.dto.carDto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.CarStatus;

@RequiredArgsConstructor
@Getter
@Setter
public class CarDto {
    private Long carId;
    private String name;
    private String photoUrl;
    private Double locationX;
    private Double locationY;
    private Integer fuelLevel;
    private String vinNumber;
    private String color;
    private Integer year;
    private String description;
    private CarStatus carStatus;
    private CarModelDto carModelDto;
}
