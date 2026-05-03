package org.sharing.carsharing.dto.carDto.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.BodyType;
import org.sharing.carsharing.model.enums.Transmission;

@RequiredArgsConstructor
@Getter
@Setter
public class CarModelAddRequest {
    private String name;
    private Transmission transmission;
    private Integer seats;
    private BodyType bodyType;
    private Float coefficient;
    private Long carManufactureId;
}