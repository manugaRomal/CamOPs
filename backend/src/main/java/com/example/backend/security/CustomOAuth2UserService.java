package com.example.backend.security;

import com.example.backend.service.UserAccountService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.stream.Collectors;

/**
 * After Google returns a profile, persist/link the local user and attach DB roles to the OAuth2User.
 */
@Component
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserAccountService userAccountService;

    public CustomOAuth2UserService(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User o = super.loadUser(userRequest);
        String sub = o.getAttribute("sub");
        String email = o.getAttribute("email");
        String name = o.getAttribute("name");
        String picture = o.getAttribute("picture");
        var user = userAccountService.upsertFromOAuth(sub, email, name, picture);
        var roleNames = userAccountService.loadRoleNames(user.getUserId());
        var authorities = roleNames.stream()
                .<GrantedAuthority>map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toSet());
        return new DefaultOAuth2User(authorities, o.getAttributes(), "sub");
    }
}
