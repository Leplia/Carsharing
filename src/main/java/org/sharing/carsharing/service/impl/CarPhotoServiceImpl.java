package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.carDto.CarPhotoDto;
import org.sharing.carsharing.dto.carDto.request.CarPhotoAddRequest;
import org.sharing.carsharing.mapper.car.CarPhotoMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.CarPhoto;
import org.sharing.carsharing.repository.CarPhotoRepository;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.service.CarPhotoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarPhotoServiceImpl implements CarPhotoService {

    private final CarPhotoRepository carPhotoRepository;
    private final CarsRepository carsRepository;
    private final CarPhotoMapper carPhotoMapper;

    @Override
    public CarPhotoDto addPhoto(Long carId, CarPhotoAddRequest request) {
        Car car = carsRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found: " + carId));

        // If this photo is marked as main, unset previous main
        if (Boolean.TRUE.equals(request.getIsMain())) {
            carPhotoRepository.findByCarCarIdAndIsMainTrue(carId)
                    .ifPresent(p -> {
                        p.setIsMain(false);
                        carPhotoRepository.save(p);
                    });
        }

        CarPhoto photo = CarPhoto.builder()
                .car(car)
                .url(request.getUrl())
                .description(request.getDescription())
                .isMain(Boolean.TRUE.equals(request.getIsMain()))
                .uploadedAt(LocalDateTime.now())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        return carPhotoMapper.toDto(carPhotoRepository.save(photo));
    }

    @Override
    public List<CarPhotoDto> getPhotosByCarId(Long carId) {
        return carPhotoRepository.findAllByCarCarIdOrderBySortOrderAsc(carId)
                .stream()
                .map(carPhotoMapper::toDto)
                .toList();
    }

    @Override
    public void deletePhoto(Long photoId) {
        carPhotoRepository.deleteById(photoId);
    }

    @Override
    @Transactional
    public CarPhotoDto setMainPhoto(Long photoId) {
        CarPhoto photo = carPhotoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found: " + photoId));

        // Unset current main
        carPhotoRepository.findByCarCarIdAndIsMainTrue(photo.getCar().getCarId())
                .ifPresent(p -> {
                    p.setIsMain(false);
                    carPhotoRepository.save(p);
                });

        photo.setIsMain(true);
        return carPhotoMapper.toDto(carPhotoRepository.save(photo));
    }
}
