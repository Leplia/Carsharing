package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.CarPhotoDto;
import org.sharing.carsharing.dto.carDto.request.CarPhotoAddRequest;
import org.sharing.carsharing.service.CarPhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars/{carId}/photos")
@RequiredArgsConstructor
public class CarPhotoController {

    private final CarPhotoService carPhotoService;

    @GetMapping
    public ResponseEntity<List<CarPhotoDto>> getPhotos(@PathVariable Long carId) {
        return ResponseEntity.ok(carPhotoService.getPhotosByCarId(carId));
    }

    @PostMapping
    public ResponseEntity<CarPhotoDto> addPhoto(
            @PathVariable Long carId,
            @RequestBody CarPhotoAddRequest request) {
        return ResponseEntity.ok(carPhotoService.addPhoto(carId, request));
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable Long carId,
            @PathVariable Long photoId) {
        carPhotoService.deletePhoto(photoId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{photoId}/setMain")
    public ResponseEntity<CarPhotoDto> setMain(
            @PathVariable Long carId,
            @PathVariable Long photoId) {
        return ResponseEntity.ok(carPhotoService.setMainPhoto(photoId));
    }
}
