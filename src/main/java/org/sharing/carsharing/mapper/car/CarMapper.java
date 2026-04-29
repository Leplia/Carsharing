package org.sharing.carsharing.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.model.Car;

@Mapper(componentModel = "spring", uses = CarModelMapper.class)
public interface CarMapper {
    @Mapping(source = "carId", target = "carId")
    @Mapping(source = "carModel", target = "carModelDto")
    @Mapping(source = "carStatus", target = "carStatus")
    CarDto toDto(Car car);
}
