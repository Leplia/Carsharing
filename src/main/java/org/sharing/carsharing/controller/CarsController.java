package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.request.CarDeleteRequest;
import org.sharing.carsharing.service.CarsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarsController {
    private final CarsService carsService;

    @GetMapping("/getAvailableCars")
    public ResponseEntity<List<CarDto>> getAllCars() {
        List<CarDto> carsDto = carsService.getAvailableCars();
        return ResponseEntity.ok(carsDto);
    }

    @PostMapping("/addCar")
    public ResponseEntity<CarDto> addCar(@RequestBody CarAddRequest carAddRequest) {
        CarDto carDto = carsService.addCar(carAddRequest);
        return ResponseEntity.ok(carDto);
    }

    @DeleteMapping("/deleteCar/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carsService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }

}
