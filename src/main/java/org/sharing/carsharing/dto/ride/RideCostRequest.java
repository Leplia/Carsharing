package org.sharing.carsharing.dto.ride;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class RideCostRequest {
    private Long carId;
    private double distanceKm;
}