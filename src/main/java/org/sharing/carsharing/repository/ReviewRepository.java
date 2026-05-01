package org.sharing.carsharing.repository;

import org.sharing.carsharing.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByCarCarIdOrderByReviewDateDesc(Long carId);
    List<Review> findAllByOrderByReviewDateDesc();
}
