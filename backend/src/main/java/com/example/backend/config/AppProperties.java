package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String frontendUrl = "http://localhost:5173";
    private String backendBaseUrl = "http://localhost:8080";
    private final Jwt jwt = new Jwt();
    private final Security security = new Security();

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    public String getBackendBaseUrl() {
        return backendBaseUrl;
    }

    public void setBackendBaseUrl(String backendBaseUrl) {
        this.backendBaseUrl = backendBaseUrl;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Security getSecurity() {
        return security;
    }

    public static class Jwt {
        private String secret = "change-me-please-32-chars-minimum";
        private long expirationMs = 86_400_000L;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMs() {
            return expirationMs;
        }

        public void setExpirationMs(long expirationMs) {
            this.expirationMs = expirationMs;
        }
    }

    public static class Security {
        private boolean permitAll = false;

        public boolean isPermitAll() {
            return permitAll;
        }

        public void setPermitAll(boolean permitAll) {
            this.permitAll = permitAll;
        }
    }
}
