package com.example.backend.controller.dto;

public class OauthLoginInfoResponse {

    private String googleAuthorizationUrl;

    public OauthLoginInfoResponse() {}

    public OauthLoginInfoResponse(String googleAuthorizationUrl) {
        this.googleAuthorizationUrl = googleAuthorizationUrl;
    }

    public String getGoogleAuthorizationUrl() {
        return googleAuthorizationUrl;
    }

    public void setGoogleAuthorizationUrl(String googleAuthorizationUrl) {
        this.googleAuthorizationUrl = googleAuthorizationUrl;
    }
}
