package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarManufactureAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarModelAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.CarManufactureDto;
import org.sharing.carsharing.dto.carDto.CarModelDto;
import org.sharing.carsharing.dto.carDto.CarModelOptionDto;
import org.sharing.carsharing.dto.carDto.request.CarDeleteRequest;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.CarsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarsController {
    private final CarsService carsService;
    private final AdminAccessService adminAccessService;

    @GetMapping("/getAvailableCars")
    public ResponseEntity<List<CarDto>> getAvailableCars() {
        return ResponseEntity.ok(carsService.getAvailableCars());
    }

    @GetMapping("/getAllCars")
    public ResponseEntity<List<CarDto>> getAllCars() {
        return ResponseEntity.ok(carsService.getAllCars());
    }

    @GetMapping("/models")
    public ResponseEntity<List<CarModelOptionDto>> getCarModels() {
        return ResponseEntity.ok(carsService.getCarModels());
    }

    @GetMapping("/manufactures")
    public ResponseEntity<List<CarManufactureDto>> getAllCarManufactures() {
        return ResponseEntity.ok(carsService.getAllCarManufactures());
    }

    @PutMapping("/{id}/refuel")
    public ResponseEntity<CarDto> refuelCar(@PathVariable Long id) {
        CarDto updatedCar = carsService.refuelCar(id);
        return ResponseEntity.ok(updatedCar);
    }

    @PostMapping("/addCar")
    public ResponseEntity<CarDto> addCar(
            @RequestBody CarAddRequest carAddRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN);
        return ResponseEntity.ok(carsService.addCar(carAddRequest));
    }

    @PostMapping("/addCarModel")
    public ResponseEntity<CarModelDto> addCarModel(
            @RequestBody CarModelAddRequest carModelAddRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN);
        return ResponseEntity.ok(carsService.addCarModel(carModelAddRequest));
    }

    @PostMapping("/addCarManufacture")
    public ResponseEntity<CarManufactureDto> addCarManufacture(
            @RequestBody CarManufactureAddRequest carManufactureAddRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN);
        return ResponseEntity.ok(carsService.addCarManufacture(carManufactureAddRequest));
    }

    @DeleteMapping("/deleteCar/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carsService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CarDto> updateStatus(
            @PathVariable Long id,
            @RequestParam CarStatus status) {
        return ResponseEntity.ok(carsService.updateCarStatus(id, status));
    }
}
