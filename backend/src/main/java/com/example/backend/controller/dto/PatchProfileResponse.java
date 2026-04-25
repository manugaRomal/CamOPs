package com.example.backend.controller.dto;

/**
 * Returned from PATCH /api/auth/me so the client can replace the stored JWT (name may have changed).
 */
public class PatchProfileResponse {

    private CurrentUserResponse profile;
    private String accessToken;

    public PatchProfileResponse() {}

    public PatchProfileResponse(CurrentUserResponse profile, String accessToken) {
        this.profile = profile;
        this.accessToken = accessToken;
    }

    public CurrentUserResponse getProfile() {
        return profile;
    }

    public void setProfile(CurrentUserResponse profile) {
        this.profile = profile;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
