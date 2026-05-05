package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.ride.RideCostRequest;
import org.sharing.carsharing.dto.ride.RideCostResponse;
import org.sharing.carsharing.model.User;

public interface RideCostService {
    RideCostResponse calculateCost(User user, RideCostRequest request);
}