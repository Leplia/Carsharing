package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.ReviewDto;
import org.sharing.carsharing.dto.ReviewReplyRequest;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AdminAccessService adminAccessService;

    @GetMapping("/all")
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByCarId(@PathVariable Long carId) {
        return ResponseEntity.ok(reviewService.getReviewsByCarId(carId));
    }

    @PutMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewDto> replyToReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN, Role.SISADMIN);
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN, Role.SISADMIN);
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
