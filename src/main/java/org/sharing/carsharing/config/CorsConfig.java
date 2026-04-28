package org.sharing.carsharing.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")  // Применить ко всем эндпоинтам
                        .allowedOrigins("http://localhost:5174", "http://localhost:5173")  // Разрешенные источники
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")  // Разрешенные HTTP методы
                        .allowedHeaders("*")  // Разрешить все заголовки
                        .allowCredentials(true)  // Разрешить отправку куки/авторизации
                        .maxAge(3600);  // Время кэширования preflight-запроса (в секундах)
            }
        };
    }
}
