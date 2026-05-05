package org.sharing.carsharing.integration;

import lombok.Data;

@Data
class CreateOrderRequest {
    private Long carId;
    private Double price;
}

@Data
class EndOrderWithLocationRequest {
    private Double distanceKm;
    private Double spendFuel;
    private Double newLocationX;
    private Double newLocationY;
}

@Data
class OrderDto {
    private Long orderId;
    private Long userId;
    private Long carId;
    private String startTime;
    private String endTime;
    private String status;
    private Double distance;
    private Double spendFuel;
    private Double price;
    private Double discount;
    private Float ratingEdits;
}