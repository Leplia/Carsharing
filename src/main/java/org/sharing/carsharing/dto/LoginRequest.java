package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.ServiceType;

@NoArgsConstructor
@Setter
@Getter
public class LoginRequest {
    private String logmail;
    private String password;
    private ServiceType serviceType;
}
