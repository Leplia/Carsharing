package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.ride.RideCostRequest;
import org.sharing.carsharing.dto.ride.RideCostResponse;
import org.sharing.carsharing.exception.CarNotFoundException;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.service.RideCostService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RideCostServiceImpl implements RideCostService {
    
    private final CarsRepository carsRepository;
    private static final double BASE_RATE = 4.0;
    
    @Override
    public RideCostResponse calculateCost(User user, RideCostRequest request) {
        // Взять машину по carId
        Car car = carsRepository.findById(request.getCarId())
                .orElseThrow(() -> new CarNotFoundException(request.getCarId()));
        
        // baseRate = 4.0
        double baseRate = BASE_RATE;
        
        // coefficient = car.getCarModel().getCoefficient()
        double coefficient = car.getCarModel().getCoefficient();
        
        // discount = 0 (поле disabled убрано)
        double discountPercent = 0.0;
        
        // totalCost = distanceKm * baseRate * coefficient * (1 – discount/100)
        double totalCost = request.getDistanceKm() * baseRate * coefficient * (1 - discountPercent / 100);
        
        RideCostResponse response = new RideCostResponse();
        response.setTotalCost(totalCost);
        response.setBaseRate(baseRate);
        response.setCoefficient(coefficient);
        response.setDiscountPercent(discountPercent);
        response.setDistanceKm(request.getDistanceKm());
        
        return response;
    }
}