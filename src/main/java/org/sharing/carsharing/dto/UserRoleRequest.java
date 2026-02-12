package org.sharing.carsharing.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.sharing.carsharing.model.enums.Role;

@RequiredArgsConstructor
@Getter
@Setter
public class UserRoleRequest {
    public Role role;
}
