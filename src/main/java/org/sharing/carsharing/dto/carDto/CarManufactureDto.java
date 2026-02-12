package org.sharing.carsharing.dto.carDto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class CarManufactureDto {
    private String name;
    private String country;
    private String badgeUrl;
}
