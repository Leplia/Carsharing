package org.sharing.carsharing.dto.order;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.OrderStatus;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Getter
@Setter
public class OrderDto {
    private Long orderId;
    private Long userId;
    private Long carId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private OrderStatus status;
    private Double distance;
    private Double spendFuel;
    private Double price;
    private Double discount;
    private Float ratingEdits;
}