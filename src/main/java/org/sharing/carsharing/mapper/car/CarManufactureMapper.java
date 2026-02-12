package org.sharing.carsharing.mapper.car;

import org.mapstruct.Mapper;
import org.sharing.carsharing.dto.carDto.CarManufactureDto;
import org.sharing.carsharing.model.CarManufacture;

@Mapper(componentModel = "spring")
public interface CarManufactureMapper {
    CarManufactureDto toDto(CarManufacture carManufacture);
}
