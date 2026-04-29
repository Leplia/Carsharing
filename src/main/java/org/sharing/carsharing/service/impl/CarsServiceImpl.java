package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.CarModelOptionDto;
import org.sharing.carsharing.mapper.car.CarMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.CarModel;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.repository.CarModelRepository;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.service.CarsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarsServiceImpl implements CarsService {
    private final CarsRepository carsRepository;
    private final CarModelRepository carModelRepository;
    private final CarMapper carMapper;

    @Override
    public List<CarDto> getAvailableCars() {
        return carsRepository.findAllByCarStatus(CarStatus.AVAILABLE)
                .stream().map(carMapper::toDto).toList();
    }

    @Override
    public List<CarDto> getAllCars() {
        return carsRepository.findAll()
                .stream().map(carMapper::toDto).toList();
    }

    @Override
    public CarDto addCar(CarAddRequest carAddRequest) {
        Car car = new Car();
        car.setVinNumber(carAddRequest.getVinNumber());
        car.setColor(carAddRequest.getColor());
        car.setYear(carAddRequest.getYear());
        car.setCarStatus(CarStatus.AVAILABLE);
        car.setFuelLevel(100);
        car.setLocationX(carAddRequest.getLocationX());
        car.setLocationY(carAddRequest.getLocationY());
        car.setDescription(carAddRequest.getDescription());
        car.setPhotoUrl(carAddRequest.getPhotoUrl());
        
        // Найти CarModel по ID
        CarModel carModel = carModelRepository.findById(carAddRequest.getCarModelId())
                .orElseThrow(() -> new RuntimeException("CarModel not found with id: " + carAddRequest.getCarModelId()));
        car.setCarModel(carModel);
        
        return carMapper.toDto(carsRepository.save(car));
    }

    @Override
    public void deleteCar(Long id) {
        carsRepository.deleteById(id);
    }

    @Override
    public CarDto updateCarStatus(Long id, CarStatus status) {
        Car car = carsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found: " + id));
        car.setCarStatus(status);
        return carMapper.toDto(carsRepository.save(car));
    }

    @Override
    public List<CarModelOptionDto> getCarModels() {
        return carModelRepository.findAll()
                .stream()
                .map(model -> {
                    CarModelOptionDto dto = new CarModelOptionDto();
                    dto.setCarModelId(model.getModelId());
                    dto.setName(model.getName());
                    dto.setCarManufactureName(model.getCarManufacture().getName());
                    return dto;
                })
                .toList();
    }
}
