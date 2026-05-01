package org.sharing.carsharing.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.sharing.carsharing.dto.ReviewDto;
import org.sharing.carsharing.model.Review;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(source = "car.carId", target = "carId")
    @Mapping(source = "car.carModel.name", target = "carName")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.login", target = "userLogin")
    ReviewDto toDto(Review review);
}
