package org.sharing.carsharing.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.carDto.CarModelDto;
import org.sharing.carsharing.model.CarModel;

@Mapper(componentModel = "spring", uses = CarManufactureMapper.class)
public interface CarModelMapper {
    @Mapping(source = "carManufacture", target = "carManufactureDto")
    CarModelDto toDto(CarModel carModel);
}
