package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class UserVerificationRequest {
    private Long userId;
    private Boolean verified;
}