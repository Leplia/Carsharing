package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponseDto {
    private Long orderId;
    private Long carId;
    private Long userId;
    private String status;
    private Double price;
    private Double distance;
    private Double spendFuel;
    private Float ratingEdits;
}