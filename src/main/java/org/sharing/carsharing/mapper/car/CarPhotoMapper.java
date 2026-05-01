package org.sharing.carsharing.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.carDto.CarPhotoDto;
import org.sharing.carsharing.model.CarPhoto;

@Mapper(componentModel = "spring")
public interface CarPhotoMapper {
    @Mapping(source = "car.carId", target = "carId")
    CarPhotoDto toDto(CarPhoto carPhoto);
}
