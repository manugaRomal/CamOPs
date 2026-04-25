package com.example.backend.security;

import com.example.backend.config.AppProperties;
import com.example.backend.domain.User;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * On successful Google login, send the user back to the SPA with a JWT in the query string.
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    public OAuth2LoginSuccessHandler(
            JwtService jwtService,
            UserRepository userRepository,
            AppProperties appProperties
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            getRedirectStrategy().sendRedirect(
                    request,
                    response,
                    buildFrontend("/login?oauthError=missing_email")
            );
            return;
        }
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElse(null);
        if (user == null) {
            getRedirectStrategy().sendRedirect(
                    request,
                    response,
                    buildFrontend("/login?oauthError=user_not_persisted")
            );
            return;
        }
        String jwt = jwtService.createToken(user);
        String tokenParam = URLEncoder.encode(jwt, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(
                request,
                response,
                buildFrontend("/login?token=" + tokenParam)
        );
    }

    private String buildFrontend(String path) {
        String base = appProperties.getFrontendUrl() == null
                ? "http://localhost:5173"
                : appProperties.getFrontendUrl().replaceAll("/$", "");
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return base + path;
    }
}
