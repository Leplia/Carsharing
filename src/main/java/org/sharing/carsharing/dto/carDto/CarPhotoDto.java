package org.sharing.carsharing.dto.carDto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Getter
@Setter
public class CarPhotoDto {
    private Long photoId;
    private Long carId;
    private String url;
    private String description;
    private Boolean isMain;
    private LocalDateTime uploadedAt;
    private Integer sortOrder;
}
