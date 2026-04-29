package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name="reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="review_id")
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(name="review_text")
    private String reviewText;

    @Column(name="review_date")
    private LocalDateTime reviewDate;

    @Column(name="admin_reply", length = 2000)
    private String adminReply;

    @Column(name="reply_date")
    private LocalDateTime replyDate;

    @Column(name="rating")
    private Integer rating;
}
