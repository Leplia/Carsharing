package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.carDto.CarPhotoDto;
import org.sharing.carsharing.dto.carDto.request.CarPhotoAddRequest;

import java.util.List;

public interface CarPhotoService {
    CarPhotoDto addPhoto(Long carId, CarPhotoAddRequest request);
    List<CarPhotoDto> getPhotosByCarId(Long carId);
    void deletePhoto(Long photoId);
    CarPhotoDto setMainPhoto(Long photoId);
}
