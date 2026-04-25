package com.example.backend.dto.auth;

/**
 * Tells the SPA how to start the Google OAuth2 flow in the browser (full URL on the backend).
 */
public class OauthLoginInfo {
    private String googleAuthorizationUrl;

    public OauthLoginInfo() {
    }

    public OauthLoginInfo(String googleAuthorizationUrl) {
        this.googleAuthorizationUrl = googleAuthorizationUrl;
    }

    public String getGoogleAuthorizationUrl() {
        return googleAuthorizationUrl;
    }

    public void setGoogleAuthorizationUrl(String googleAuthorizationUrl) {
        this.googleAuthorizationUrl = googleAuthorizationUrl;
    }
}
