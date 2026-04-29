package org.sharing.carsharing.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler,
                          CorsConfigurationSource corsConfigurationSource) {
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/oauth2/**",
                    "/login/**",
                    "/login/oauth2/**"
                ).permitAll()
                .anyRequest().permitAll()
            )
            .httpBasic(basic -> basic.disable())
            // OAuth2 requires a session to store the 'state' parameter between
            // the redirect to GitHub and the callback. IF_REQUIRED is correct here.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    String redirectUrl = "http://localhost:5173/login?error=" +
                        java.net.URLEncoder.encode(
                            "Ошибка авторизации через GitHub: " + exception.getMessage(),
                            java.nio.charset.StandardCharsets.UTF_8
                        );
                    response.sendRedirect(redirectUrl);
                })
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
