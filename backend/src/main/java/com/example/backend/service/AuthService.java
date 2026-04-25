package com.example.backend.service;

import com.example.backend.config.AppProperties;
import com.example.backend.controller.dto.PatchProfileResponse;
import com.example.backend.controller.dto.ProfilePatchRequest;
import com.example.backend.domain.Role;
import com.example.backend.domain.User;
import com.example.backend.dto.auth.AuthUserResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.SignInRequest;
import com.example.backend.dto.auth.TokenResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    public static final String DEFAULT_NEW_USER_ROLE = "STUDENT";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AppProperties appProperties
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.appProperties = appProperties;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.findByEmailIgnoreCase(request.getEmail().trim()).isPresent()) {
            throw new BadRequestException("This email is already registered");
        }
        Role role = roleRepository.findByRoleName(DEFAULT_NEW_USER_ROLE)
                .orElseThrow(() -> new IllegalStateException("Role " + DEFAULT_NEW_USER_ROLE + " is missing. Restart the app to seed roles."));

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(emptyToNull(request.getPhone()));
        user.setDepartment(emptyToNull(request.getDepartment()));
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.addRole(role);
        user = userRepository.save(user);
        return tokenResponse(user);
    }

    @Transactional(readOnly = true)
    public Optional<TokenResponse> signIn(SignInRequest request) {
        return userRepository
                .findByEmailIgnoreCase(request.getEmail().trim())
                .filter(User::isActive)
                .filter(u -> u.getPasswordHash() != null)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .map(this::tokenResponse);
    }

    @Transactional(readOnly = true)
    public AuthUserResponse toResponse(User user) {
        List<String> roles = user.getRoleLinks().stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());
        AuthUserResponse r = new AuthUserResponse();
        r.setId(user.getId());
        r.setFullName(user.getFullName());
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setDepartment(user.getDepartment());
        r.setProfileImageUrl(user.getProfileImageUrl());
        r.setRoles(roles);
        return r;
    }

    private TokenResponse tokenResponse(User user) {
        return new TokenResponse(
                jwtService.createToken(user),
                appProperties.getJwt().getExpirationMs()
        );
    }

    private static String emptyToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    @Transactional
    public PatchProfileResponse updateProfile(long userId, ProfilePatchRequest body) {
        if (body.getFullName() == null && body.getPhone() == null && body.getDepartment() == null) {
            throw new IllegalArgumentException("At least one of fullName, phone, or department is required");
        }
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
        if (body.getFullName() != null) {
            String n = body.getFullName().trim();
            if (n.isEmpty()) {
                throw new IllegalArgumentException("fullName cannot be empty");
            }
            u.setFullName(n);
        }
        if (body.getPhone() != null) {
            String p = body.getPhone().trim();
            u.setPhone(p.isEmpty() ? null : p);
        }
        if (body.getDepartment() != null) {
            String d = body.getDepartment().trim();
            u.setDepartment(d.isEmpty() ? null : d);
        }
        u = userRepository.save(u);
        String token = jwtService.createToken(u);
        return new PatchProfileResponse(toResponse(u), token);
    }

    /**
     * Idempotent: assigns the role if the user does not already have it. Role name must exist in {@code Roles}.
     */
    @Transactional
    public void addRoleToUser(long userId, String roleName) {
        if (roleName == null) {
            throw new IllegalArgumentException("roleName is required");
        }
        String name = roleName.trim().toUpperCase();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
        Role role = roleRepository.findByRoleName(name)
                .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + name));
        boolean has = user.getRoleLinks().stream()
                .anyMatch(ur -> ur.getRole().getId().equals(role.getId()));
        if (!has) {
            user.addRole(role);
            userRepository.save(user);
        }
    }
}
