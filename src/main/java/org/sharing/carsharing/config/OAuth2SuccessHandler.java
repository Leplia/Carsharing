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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
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
        Map<String, Object> attrs = oauthUser.getAttributes();

        // GitHub provides 'login' as username, 'email' may be null if private
        String login = (String) attrs.get("login");
        String email = (String) attrs.get("email");
        Number githubIdValue = (Number) attrs.get("id");

        if (githubIdValue == null) {
            redirectWithError(response, "Не удалось получить GitHub ID");
            return;
        }

        Long githubId = githubIdValue.longValue();

        // Fallback for missing login
        if (login == null || login.isBlank()) {
            login = "github_" + githubId;
        }

        // Fallback for private/missing email — GitHub uses noreply address
        if (email == null || email.isBlank()) {
            email = githubId + "+github@users.noreply.github.com";
        }

        final String resolvedLogin = login;
        final String resolvedEmail = email;

        // Try to find existing GitHub user
        Optional<User> existingGithubUser = userRepository.findByServiceTypeAndServiceId(ServiceType.GITHUB, githubId);
        User user;

        if (existingGithubUser.isPresent()) {
            user = existingGithubUser.get();
        } else {
            // Check if email is already taken by a LOCAL account
            Optional<User> existingByEmail = userRepository.findByEmail(resolvedEmail);
            if (existingByEmail.isPresent() && existingByEmail.get().getServiceType() == ServiceType.LOCAL) {
                redirectWithError(response,
                    "Аккаунт с таким email уже зарегистрирован. Используйте обычный вход.");
                return;
            }

            User newUser = new User();
            newUser.setEmail(resolvedEmail);
            newUser.setLogin(generateUniqueLogin(resolvedLogin));
            newUser.setPhone("+70000000000");
            newUser.setPassword("");
            newUser.setRole(Role.USER);
            newUser.setBlocked(false);
            newUser.setRating(5.0F);
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
                .queryParam("error", URLEncoder.encode(errorMessage, StandardCharsets.UTF_8))
                .build(true)
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
