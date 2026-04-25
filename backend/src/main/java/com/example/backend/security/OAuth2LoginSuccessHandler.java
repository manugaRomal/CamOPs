package com.example.backend.security;

import com.example.backend.config.AppProperties;
import com.example.backend.domain.UserEntity;
import com.example.backend.repository.UserEntityRepository;
import com.example.backend.service.UserAccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserEntityRepository userEntityRepository;
    private final UserAccountService userAccountService;
    private final AppProperties appProperties;

    public OAuth2LoginSuccessHandler(
            UserEntityRepository userEntityRepository,
            UserAccountService userAccountService,
            AppProperties appProperties
    ) {
        this.userEntityRepository = userEntityRepository;
        this.userAccountService = userAccountService;
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OAuth2User oauth = (OAuth2User) authentication.getPrincipal();
        String sub = oauth.getAttribute("sub");
        UserEntity user = userEntityRepository.findByGoogleSub(sub)
                .or(() -> userEntityRepository.findByEmail(oauth.getAttribute("email")))
                .orElseThrow(() -> new IllegalStateException("User should exist after OAuth2UserService"));
        String jwt = userAccountService.issueJwtForUser(user);
        String target = appProperties.getFrontendUrl().replaceAll("/$", "")
                + "/auth/callback?token="
                + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, target);
    }
}
