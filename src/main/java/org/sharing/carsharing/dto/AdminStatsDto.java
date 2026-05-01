package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminStatsDto {
    private long totalUsers;
    private long verifiedUsers;
    private long blockedUsers;
    private long totalCars;
    private long availableCars;
    private long outOfServiceCars;
    private long totalReviews;
    private long unansweredReviews;
}
