package com.example.backend.controller.dto;

import com.example.backend.dto.auth.AuthUserResponse;

/**
 * Returned from PATCH /api/auth/me so the client can replace the stored JWT (name may have changed).
 */
public class PatchProfileResponse {

    private AuthUserResponse profile;
    private String accessToken;

    public PatchProfileResponse() {
    }

    public PatchProfileResponse(AuthUserResponse profile, String accessToken) {
        this.profile = profile;
        this.accessToken = accessToken;
    }

    public AuthUserResponse getProfile() {
        return profile;
    }

    public void setProfile(AuthUserResponse profile) {
        this.profile = profile;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
