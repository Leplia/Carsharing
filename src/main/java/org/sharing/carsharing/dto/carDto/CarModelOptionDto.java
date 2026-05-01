package org.sharing.carsharing.dto.carDto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class CarModelOptionDto {
    private Long carModelId;
    private String name;
    private String carManufactureName;
}