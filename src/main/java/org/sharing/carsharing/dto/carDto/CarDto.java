package org.sharing.carsharing.dto.carDto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class CarDto {
    private String name;
    private String photoUrl;
    private Double locationX;
    private Double locationY;
    private Integer fuelLevel;
    private String vinNumber;
    private String color;
    private String description;
    private CarModelDto carModelDto;
}
