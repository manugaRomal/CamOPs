package com.example.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Holds {@link PasswordEncoder} and the OAuth2 failure handler in a separate
 * {@link Configuration} so {@link com.example.backend.security.SecurityConfig} does not
 * depend on beans defined in the same class (avoids a circular-dependency at startup).
 */
@Configuration
public class SecurityAuthBeansConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityAuthBeansConfig.class);

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Redirects failed Google OAuth2 attempts back to the SPA with a query param.
     */
    @Bean(name = "oauth2LoginFailureHandler")
    public AuthenticationFailureHandler oauth2LoginFailureHandler(AppProperties appProperties) {
        return new SimpleUrlAuthenticationFailureHandler() {
            @Override
            public void onAuthenticationFailure(
                    HttpServletRequest request,
                    HttpServletResponse response,
                    AuthenticationException exception
            ) throws IOException, ServletException {
                log.warn("OAuth2 login failure: {}", exception.getMessage(), exception);
                String msg = exception.getMessage() != null ? exception.getMessage() : "OAuth2 login failed";
                String encoded = URLEncoder.encode(msg, StandardCharsets.UTF_8);
                String frontendBase = appProperties.getFrontendUrl() != null
                        ? appProperties.getFrontendUrl().replaceAll("/$", "")
                        : "http://localhost:5173";
                String target = frontendBase + "/login?oauthError=" + encoded;
                getRedirectStrategy().sendRedirect(request, response, target);
            }
        };
    }
}
