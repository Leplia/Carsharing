package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.mapper.car.CarMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.service.CarsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarsServiceImpl implements CarsService {
    private final CarsRepository carsRepository;
    private final CarMapper carMapper;

    @Override
    public List<CarDto> getAvailableCars(){
        List<Car> cars = carsRepository.findAllAvailable();
        return cars.stream().map(carMapper::toDto).toList();
    }

    @Override
    public CarDto addCar(CarAddRequest carAddRequest){
        Car car=new Car();
        car.setVinNumber(carAddRequest.getVinNumber());
        car.setColor(carAddRequest.getColor());
        car.setYear(carAddRequest.getYear());
        car.setCarStatus(CarStatus.AVAILABLE);
        car.setFuelLevel(100);
        car.setLocationX(carAddRequest.getLocationX());
        car.setLocationY(carAddRequest.getLocationY());
        car.setDescription(carAddRequest.getDescription());
        car.setPhotoUrl(carAddRequest.getPhotoUrl());
        car.setCarModel(carAddRequest.getCarModel());
        carsRepository.save(car);

        return carMapper.toDto(car);
    }

    @Override
    public void deleteCar(Long id){
        carsRepository.deleteById(id);
    }
}
