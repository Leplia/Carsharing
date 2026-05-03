package org.sharing.carsharing.dto.carDto.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class CarManufactureAddRequest {
    private String name;
    private String country;
    private String badgeUrl;
}