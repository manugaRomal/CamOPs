package com.example.backend.controller;

import com.example.backend.config.AppProperties;
import com.example.backend.controller.dto.ProfilePatchRequest;
import com.example.backend.domain.User;
import com.example.backend.dto.auth.AuthUserResponse;
import com.example.backend.dto.auth.OauthLoginInfo;
import com.example.backend.controller.dto.PatchProfileResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.SignInRequest;
import com.example.backend.dto.auth.TokenResponse;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthPrincipal;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    public AuthController(AuthService authService, UserRepository userRepository, AppProperties appProperties) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    @GetMapping("/login")
    public OauthLoginInfo oauthStartUrl() {
        String base = appProperties.getBackendBaseUrl() == null
                ? "http://localhost:8080"
                : appProperties.getBackendBaseUrl().replaceAll("/$", "");
        return new OauthLoginInfo(base + "/oauth2/authorization/google");
    }

    @PostMapping("/register")
    public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/sign-in")
    public ResponseEntity<TokenResponse> signIn(@Valid @RequestBody SignInRequest request) {
        Optional<TokenResponse> t = authService.signIn(request);
        return t.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return authService.toResponse(user);
    }

    @PatchMapping("/me")
    public PatchProfileResponse updateMe(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody ProfilePatchRequest body
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return authService.updateProfile(principal.getUserId(), body);
    }
}
