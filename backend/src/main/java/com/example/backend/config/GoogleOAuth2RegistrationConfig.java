package com.example.backend.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.util.StringUtils;

/**
 * Ensures a {@link ClientRegistrationRepository} exists (Spring Boot 4+ may not create one
 * in some layouts). This registers Google for {@code /oauth2/authorization/google}.
 * <p>
 * Properties are read via {@link Environment} so they resolve the same way as
 * {@code application.properties} (including {@code ${ENV:default}}), avoiding
 * {@code @Value} placeholder issues on long {@code spring.security.*} keys.
 */
@Configuration
public class GoogleOAuth2RegistrationConfig {

    private static final String PFX = "spring.security.oauth2.client.registration.google.";

    @Bean
    @ConditionalOnMissingBean(ClientRegistrationRepository.class)
    public ClientRegistrationRepository clientRegistrationRepository(Environment env) {
        String clientId = env.getProperty(PFX + "client-id");
        String clientSecret = env.getProperty(PFX + "client-secret");
        String redirectUri = env.getProperty(
                PFX + "redirect-uri",
                "http://localhost:8080/login/oauth2/code/google"
        );
        if (!StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret)) {
            throw new IllegalStateException(
                    "Google OAuth2 is not configured. Set " + PFX + "client-id and " + PFX + "client-secret "
                            + "(e.g. in application.properties or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)."
            );
        }
        ClientRegistration google = ClientRegistration.withRegistrationId("google")
                .clientId(clientId.trim())
                .clientSecret(clientSecret.trim())
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(redirectUri)
                .scope("profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();
        return new InMemoryClientRegistrationRepository(google);
    }
}
