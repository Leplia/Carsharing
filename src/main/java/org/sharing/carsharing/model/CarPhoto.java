package org.sharing.carsharing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "car_photos")
public class CarPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(name = "url", nullable = false, length = 1024)
    private String url;

    @Column(name = "description")
    private String description;

    @Column(name = "is_main")
    private Boolean isMain;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
