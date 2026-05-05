package org.sharing.carsharing.service.impl;

import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        boolean enabled = user.getBlocked() == null || !user.getBlocked();
        String roleName = (user.getRole() == Role.ADMIN) ? "ROLE_ADMIN" : "ROLE_USER";

        String password = user.getPassword() == null ? "" : user.getPassword();

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getLogin())
                .password(password)
                .disabled(!enabled)
                .authorities(Collections.<GrantedAuthority>singleton(new SimpleGrantedAuthority(roleName)))
                .build();
    }
}

