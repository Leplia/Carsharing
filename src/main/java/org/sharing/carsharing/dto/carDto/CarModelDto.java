package org.sharing.carsharing.dto.carDto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.BodyType;
import org.sharing.carsharing.model.enums.Transmission;

@RequiredArgsConstructor
@Getter
@Setter
public class CarModelDto {
    private String name;
    private Transmission transmission;
    private Integer seats;
    private BodyType bodyType;
    private Float coefficient;
    private CarManufactureDto carManufactureDto;
}
