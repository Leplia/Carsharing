package org.sharing.carsharing.dto.carDto.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class CarPhotoAddRequest {
    private String url;
    private String description;
    private Boolean isMain;
    private Integer sortOrder;
}
