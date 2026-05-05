package org.sharing.carsharing.mapper.order;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.OrderResponseDto;
import org.sharing.carsharing.model.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "car.carId", target = "carId")
    OrderResponseDto toDto(Order order);
}