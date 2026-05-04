package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarManufactureAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarModelAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.CarManufactureDto;
import org.sharing.carsharing.dto.carDto.CarModelDto;
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
    CarModelDto addCarModel(CarModelAddRequest carModelAddRequest);
    CarManufactureDto addCarManufacture(CarManufactureAddRequest carManufactureAddRequest);
    List<CarManufactureDto> getAllCarManufactures();

    CarDto refuelCar(Long id);
    
    // Новые методы для бронирования
    CarDto bookCar(Long id);
    CarDto startRide(Long id);
    CarDto endRide(Long id);

}
