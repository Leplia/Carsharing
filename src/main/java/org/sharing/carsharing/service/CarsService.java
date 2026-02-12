package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.request.CarDeleteRequest;

import java.util.List;

public interface CarsService {
    List<CarDto> getAvailableCars();

    CarDto addCar(CarAddRequest carAddRequest);

    void deleteCar(Long id);
}
