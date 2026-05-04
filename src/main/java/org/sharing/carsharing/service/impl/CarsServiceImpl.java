package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarManufactureAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarModelAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.CarManufactureDto;
import org.sharing.carsharing.dto.carDto.CarModelDto;
import org.sharing.carsharing.dto.carDto.CarModelOptionDto;
import org.sharing.carsharing.mapper.car.CarMapper;
import org.sharing.carsharing.mapper.car.CarManufactureMapper;
import org.sharing.carsharing.mapper.car.CarModelMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.CarManufacture;
import org.sharing.carsharing.model.CarModel;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.repository.CarManufactureRepository;
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
    private final CarManufactureRepository carManufactureRepository;
    private final CarMapper carMapper;
    private final CarModelMapper carModelMapper;
    private final CarManufactureMapper carManufactureMapper;

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

    @Override
    public CarModelDto addCarModel(CarModelAddRequest carModelAddRequest) {
        CarManufacture carManufacture = carManufactureRepository.findById(carModelAddRequest.getCarManufactureId())
                .orElseThrow(() -> new RuntimeException("CarManufacture not found with id: " + carModelAddRequest.getCarManufactureId()));
        
        CarModel carModel = new CarModel();
        carModel.setName(carModelAddRequest.getName());
        carModel.setTransmission(carModelAddRequest.getTransmission());
        carModel.setSeats(carModelAddRequest.getSeats());
        carModel.setBodyType(carModelAddRequest.getBodyType());
        carModel.setCoefficient(carModelAddRequest.getCoefficient());
        carModel.setCarManufacture(carManufacture);
        
        return carModelMapper.toDto(carModelRepository.save(carModel));
    }

    @Override
    public CarManufactureDto addCarManufacture(CarManufactureAddRequest carManufactureAddRequest) {
        CarManufacture carManufacture = new CarManufacture();
        carManufacture.setName(carManufactureAddRequest.getName());
        carManufacture.setCountry(carManufactureAddRequest.getCountry());
        carManufacture.setBadgeUrl(carManufactureAddRequest.getBadgeUrl());
        
        return carManufactureMapper.toDto(carManufactureRepository.save(carManufacture));
    }

    @Override
    public List<CarManufactureDto> getAllCarManufactures() {
        return carManufactureRepository.findAll()
                .stream()
                .map(carManufactureMapper::toDto)
                .toList();
    }

    @Override
    public CarDto refuelCar(Long id) {
        Car car = carsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Автомобиль с ID " + id + " не найден"));
        car.setFuelLevel((int) 100.0);
        Car saved = carsRepository.save(car);
        return carMapper.toDto(saved);
    }
    
    @Override
    public CarDto bookCar(Long id) {
        Car car = carsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found: " + id));
        if (car.getCarStatus() != CarStatus.AVAILABLE) {
            throw new RuntimeException("Car is not available for booking. Current status: " + car.getCarStatus());
        }
        car.setCarStatus(CarStatus.BOOKED);
        return carMapper.toDto(carsRepository.save(car));
    }
    
    @Override
    public CarDto startRide(Long id) {
        Car car = carsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found: " + id));
        if (car.getCarStatus() != CarStatus.BOOKED) {
            throw new RuntimeException("Car is not booked. Current status: " + car.getCarStatus());
        }
        car.setCarStatus(CarStatus.IN_USE);
        return carMapper.toDto(carsRepository.save(car));
    }
    
    @Override
    public CarDto endRide(Long id) {
        Car car = carsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found: " + id));
        car.setCarStatus(CarStatus.AVAILABLE);
        return carMapper.toDto(carsRepository.save(car));
    }
}
