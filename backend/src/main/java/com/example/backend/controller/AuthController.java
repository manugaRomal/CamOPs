package com.example.backend.controller;

import com.example.backend.config.AppProperties;
import com.example.backend.controller.dto.CurrentUserResponse;
import com.example.backend.controller.dto.OauthLoginInfoResponse;
import com.example.backend.controller.dto.PatchProfileResponse;
import com.example.backend.controller.dto.ProfilePatchRequest;
import com.example.backend.domain.UserEntity;
import com.example.backend.security.CamUserPrincipal;
import com.example.backend.service.UserAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppProperties appProperties;
    private final UserAccountService userAccountService;

    public AuthController(AppProperties appProperties, UserAccountService userAccountService) {
        this.appProperties = appProperties;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> me(@AuthenticationPrincipal CamUserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userAccountService.toCurrentUserResponse(principal.getUserId()));
    }

    /**
     * Update profile fields (not email or roles). Returns a new JWT if name/avatar in token should stay in sync.
     */
    @PatchMapping("/me")
    public ResponseEntity<PatchProfileResponse> updateMe(
            @AuthenticationPrincipal CamUserPrincipal principal,
            @Valid @RequestBody ProfilePatchRequest body
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UserEntity updated = userAccountService.updateProfile(principal.getUserId(), body);
        String accessToken = userAccountService.issueJwtForUser(updated);
        CurrentUserResponse profile = userAccountService.toCurrentUserResponse(updated);
        return ResponseEntity.ok(new PatchProfileResponse(profile, accessToken));
    }

    /**
     * Returns the full URL the browser should open to start Google OAuth2.
     * Uses app.backend.base-url so SPAs on another port (Vite) still get the correct backend host.
     */
    @GetMapping("/login")
    public OauthLoginInfoResponse loginInfo() {
        String base = appProperties.getBackendBaseUrl().replaceAll("/$", "");
        return new OauthLoginInfoResponse(base + "/oauth2/authorization/google");
    }
}
