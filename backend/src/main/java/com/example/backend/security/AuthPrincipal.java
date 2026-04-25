package com.example.backend.security;

import java.util.Objects;

/**
 * Minimal principal stored in the security context for JWT-based API access.
 */
public class AuthPrincipal {

    private final Long userId;
    private final String email;

    public AuthPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "AuthPrincipal{userId=" + userId + "}";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AuthPrincipal that = (AuthPrincipal) o;
        return Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }
}
