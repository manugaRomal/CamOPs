package com.example.backend.security;

import com.example.backend.domain.Role;
import com.example.backend.domain.User;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * After Google userinfo, load or create our {@link User} and attach roles to the principal.
 */
@Component
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public CustomOAuth2UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null || sub.isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_user", "Missing Google subject (sub)", null)
            );
        }
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_user", "Google did not return an email", null)
            );
        }
        String emailLower = email.trim().toLowerCase();
        String nameRaw = oAuth2User.getAttribute("name");
        final String displayName = (nameRaw == null || nameRaw.isBlank()) ? emailLower : nameRaw;
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByGoogleSub(sub)
                .or(() -> userRepository.findByEmailIgnoreCase(emailLower))
                .orElseGet(() -> createLocalUserWithStudentRole(emailLower, displayName, sub, picture));

        user.setEmail(emailLower);
        user.setFullName(displayName);
        user.setGoogleSub(sub);
        if (picture != null) {
            user.setProfileImageUrl(picture);
        }
        if (!user.isActive()) {
            user.setActive(true);
        }
        user = userRepository.save(user);

        List<org.springframework.security.core.GrantedAuthority> authorities = user.getRoleLinks().stream()
                .map(ur -> new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + ur.getRole().getRoleName()
                ))
                .collect(Collectors.toCollection(ArrayList::new));

        Map<String, Object> attrs = oAuth2User.getAttributes() != null
                ? oAuth2User.getAttributes()
                : Map.of();
        return new DefaultOAuth2User(authorities, attrs, "sub");
    }

    private User createLocalUserWithStudentRole(String email, String fullName, String sub, String picture) {
        Role student = roleRepository.findByRoleName(AuthService.DEFAULT_NEW_USER_ROLE)
                .orElseThrow(() -> new IllegalStateException("STUDENT role is missing. Restart the app to seed roles."));
        User u = new User();
        u.setFullName(fullName);
        u.setEmail(email);
        u.setGoogleSub(sub);
        u.setProfileImageUrl(picture);
        u.setActive(true);
        u.addRole(student);
        return u;
    }
}
