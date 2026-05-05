package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EndOrderRequest {
    private Double distanceKm;
    private Double spendFuel;
    private Double newLocationX;
    private Double newLocationY;
}