package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Getter
@Setter
public class ReviewDto {
    private Long reviewId;
    private Long carId;
    private String carName;
    private Long userId;
    private String userLogin;
    private String reviewText;
    private LocalDateTime reviewDate;
    private String adminReply;
    private LocalDateTime replyDate;
    private Integer rating;
}
