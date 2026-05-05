package org.sharing.carsharing.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.sharing.carsharing.dto.ride.RideCostRequest;
import org.sharing.carsharing.dto.ride.RideCostResponse;
import org.sharing.carsharing.exception.CarNotFoundException;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.CarManufacture;
import org.sharing.carsharing.model.CarModel;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.service.impl.RideCostServiceImpl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RideCostServiceTest {

    @Mock
    private CarsRepository carsRepository;

    @InjectMocks
    private RideCostServiceImpl rideCostService;

    @Test
    void calculateCost_ValidRequest_ReturnsCorrectResponse() {
        // Arrange
        User user = new User();
        user.setBlocked(false);
        
        RideCostRequest request = new RideCostRequest();
        request.setCarId(1L);
        request.setDistanceKm(10.0);
        
        CarManufacture manufacture = new CarManufacture();
        manufacture.setName("Toyota");
        
        CarModel carModel = new CarModel();
        carModel.setCoefficient(1.5f);
        carModel.setCarManufacture(manufacture);
        
        Car car = new Car();
        car.setCarId(1L);
        car.setCarModel(carModel);
        
        when(carsRepository.findById(anyLong())).thenReturn(Optional.of(car));
        
        // Act
        RideCostResponse response = rideCostService.calculateCost(user, request);
        
        // Assert
        assertNotNull(response);
        assertEquals(10.0, response.getDistanceKm());
        assertEquals(4.0, response.getBaseRate());
        assertEquals(1.5, response.getCoefficient());
        assertEquals(0.0, response.getDiscountPercent());
        // totalCost = 10 * 4 * 1.5 * (1 - 0/100) = 60
        assertEquals(60.0, response.getTotalCost(), 0.001);
    }



    @Test
    void calculateCost_CarNotFound_ThrowsException() {
        // Arrange
        User user = new User();
        RideCostRequest request = new RideCostRequest();
        request.setCarId(999L);
        request.setDistanceKm(10.0);
        
        when(carsRepository.findById(anyLong())).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(CarNotFoundException.class, () -> {
            rideCostService.calculateCost(user, request);
        });
    }
}