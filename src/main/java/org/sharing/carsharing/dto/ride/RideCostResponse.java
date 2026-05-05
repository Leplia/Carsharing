package org.sharing.carsharing.dto.ride;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class RideCostResponse {
    private double totalCost;
    private double baseRate;
    private double coefficient;
    private double discountPercent;
    private double distanceKm;
}