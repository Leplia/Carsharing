package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.Role;

@NoArgsConstructor
@Getter
@Setter
public class UserRoleRequest {
    private Role role;
}
