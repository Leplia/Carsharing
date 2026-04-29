package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.CarModelOptionDto;
import org.sharing.carsharing.model.enums.CarStatus;

import java.util.List;

public interface CarsService {
    List<CarDto> getAvailableCars();
    List<CarDto> getAllCars();
    CarDto addCar(CarAddRequest carAddRequest);
    void deleteCar(Long id);
    CarDto updateCarStatus(Long id, CarStatus status);
    
    List<CarModelOptionDto> getCarModels();
}
