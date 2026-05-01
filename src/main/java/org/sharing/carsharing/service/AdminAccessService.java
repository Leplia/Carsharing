package org.sharing.carsharing.service;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.exception.AccessDeniedException;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.util.JwtTokenProvider;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAccessService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public User requireUser(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new AccessDeniedException("Требуется токен авторизации");
        }
        String token = bearerToken.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AccessDeniedException("Некорректный токен");
        }
        String login = jwtTokenProvider.getUsername(token);
        return userRepository.findByLogin(login)
                .orElseThrow(() -> new AccessDeniedException("Пользователь не найден"));
    }

    public User requireAnyRole(String bearerToken, Role... roles) {
        User actor = requireUser(bearerToken);
        Set<Role> allowed = Arrays.stream(roles).collect(Collectors.toSet());
        if (!allowed.contains(actor.getRole())) {
            throw new AccessDeniedException("Недостаточно прав");
        }
        return actor;
    }
}
