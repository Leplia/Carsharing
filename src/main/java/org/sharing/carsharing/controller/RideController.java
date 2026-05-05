package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.RideCostRequest;
import org.sharing.carsharing.dto.RideCostResponse;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.repository.CarsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ride")
@RequiredArgsConstructor
public class RideController {

    private final CarsRepository carsRepository;

    // Cost = 4 BYN/min * coefficient * (distanceKm / 40 km/h * 60) min
    // = 4 * coeff * distanceKm * 1.5 = 6 * coeff * distanceKm
    @PostMapping("/calculate")
    public ResponseEntity<RideCostResponse> calculateCost(@RequestBody RideCostRequest request) {
        Car car = carsRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));
        float coefficient = car.getCarModel().getCoefficient() != null
                ? car.getCarModel().getCoefficient() : 1.0f;
        double totalCost = 6.0 * coefficient * request.getDistanceKm();
        double rounded = Math.round(totalCost * 100.0) / 100.0;
        return ResponseEntity.ok(new RideCostResponse(rounded));
    }
}