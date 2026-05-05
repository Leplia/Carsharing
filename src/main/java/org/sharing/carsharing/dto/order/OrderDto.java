package org.sharing.carsharing.dto.order;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.OrderStatus;

@RequiredArgsConstructor
@Getter
@Setter
public class OrderDto {
    private Long orderId;
    private Long userId;
    private Long carId;
    private OrderStatus status;
    private Double distance;
    private Double spendFuel;
    private Double price;
    private Float ratingEdits;
}