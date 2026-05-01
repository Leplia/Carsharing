package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.ReviewDto;
import org.sharing.carsharing.dto.ReviewReplyRequest;

import java.util.List;

public interface ReviewService {
    List<ReviewDto> getAllReviews();
    List<ReviewDto> getReviewsByCarId(Long carId);
    ReviewDto replyToReview(Long reviewId, ReviewReplyRequest request);
    void deleteReview(Long reviewId);
}
