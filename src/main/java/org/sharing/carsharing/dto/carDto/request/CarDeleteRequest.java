package org.sharing.carsharing.dto.carDto.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Setter
@Getter
public class CarDeleteRequest {
    private long id;
}
