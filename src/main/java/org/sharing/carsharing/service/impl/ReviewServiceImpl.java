package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.ReviewDto;
import org.sharing.carsharing.dto.ReviewReplyRequest;
import org.sharing.carsharing.mapper.ReviewMapper;
import org.sharing.carsharing.model.Review;
import org.sharing.carsharing.repository.ReviewRepository;
import org.sharing.carsharing.service.ReviewService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAllByOrderByReviewDateDesc()
                .stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Override
    public List<ReviewDto> getReviewsByCarId(Long carId) {
        return reviewRepository.findAllByCarCarIdOrderByReviewDateDesc(carId)
                .stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Override
    public ReviewDto replyToReview(Long reviewId, ReviewReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));
        review.setAdminReply(request.getAdminReply());
        review.setReplyDate(LocalDateTime.now());
        return reviewMapper.toDto(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
