package org.sharing.carsharing.dto.order;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class EndOrderWithLocationRequest {
    private Double distanceKm;
    private Double spendFuel;
    private Double newLocationX; // Широта
    private Double newLocationY; // Долгота
}