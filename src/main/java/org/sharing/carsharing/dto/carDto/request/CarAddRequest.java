package org.sharing.carsharing.dto.carDto.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class CarAddRequest {
    private String vinNumber;
    private String color;
    private Integer year;
    private Double locationX;
    private Double locationY;
    private String description;
    private String photoUrl;
    private Long carModelId;
}
