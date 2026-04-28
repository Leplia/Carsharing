package org.sharing.carsharing.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.model.enums.ServiceType;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/login}")
    private String frontendRedirectUri;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String login = oauthUser.getAttribute("login");
        Number githubIdValue = oauthUser.getAttribute("id");

        if (login == null || login.isBlank()) {
            login = email != null && email.contains("@") ? email.substring(0, email.indexOf("@")) : "github_user";
        }

        if (email == null || email.isBlank()) {
            email = login + "@users.noreply.github.com";
        }
        if (githubIdValue == null) {
            redirectWithError(response, "Не удалось получить GitHub ID");
            return;
        }

        Long githubId = githubIdValue.longValue();
        final String resolvedEmail = email;
        final String resolvedLogin = login;
        Optional<User> githubUser = userRepository.findByServiceTypeAndServiceId(ServiceType.GITHUB, githubId);
        User user;

        if (githubUser.isPresent()) {
            user = githubUser.get();
        } else {
            Optional<User> existingByEmail = userRepository.findByEmail(resolvedEmail);
            if (existingByEmail.isPresent() && existingByEmail.get().getServiceType() == ServiceType.LOCAL) {
                redirectWithError(response, "Аккаунт с таким email зарегистрирован локально. Используйте обычный вход.");
                return;
            }
            User newUser = new User();
            newUser.setEmail(resolvedEmail);
            newUser.setLogin(generateUniqueLogin(resolvedLogin));
            newUser.setPhone("+70000000000");
            newUser.setPassword("");
            newUser.setRole(Role.USER);
            newUser.setBlocked(false);
            newUser.setRating(5F);
            newUser.setCredentials(null);
            newUser.setServiceType(ServiceType.GITHUB);
            newUser.setServiceId(githubId);
            user = userRepository.save(newUser);
        }

        String token = jwtTokenProvider.generateToken(user.getLogin(), user.getUserId());
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("token", token)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private String generateUniqueLogin(String baseLogin) {
        String login = baseLogin;
        int suffix = 1;
        while (userRepository.existsByLogin(login)) {
            login = baseLogin + "_" + suffix++;
        }
        return login;
    }

    private void redirectWithError(HttpServletResponse response, String errorMessage) throws IOException {
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("error", errorMessage)
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
