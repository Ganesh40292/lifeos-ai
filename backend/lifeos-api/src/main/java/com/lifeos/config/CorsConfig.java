package com.lifeos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration allowing the Vite dev server and common methods/headers.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allowed origins — read from environment or support Vercel preview/production domains
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl != null && !frontendUrl.trim().isEmpty()) {
            String cleanUrl = frontendUrl.trim().replaceAll("/+$", "");
            configuration.setAllowedOriginPatterns(List.of(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "https://*.vercel.app",
                    cleanUrl
            ));
        } else {
            configuration.setAllowedOriginPatterns(List.of(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "https://*.vercel.app"
            ));
        }

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));

        configuration.setExposedHeaders(List.of(
                "Authorization"
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
