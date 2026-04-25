package com.example.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * Public GETs for the resource catalogue: /api/resources, /api/resources/{id}, /api/resources/{id}/health, etc.
 * Mutations under /api/resources (POST, PUT, PATCH, DELETE) require authentication and role checks.
 */
public class ResourceReadRequestMatcher implements RequestMatcher {

    private static final String PREFIX = "/api/resources";

    @Override
    public boolean matches(HttpServletRequest request) {
        if (!HttpMethod.GET.matches(request.getMethod())) {
            return false;
        }
        String uri = request.getRequestURI();
        String path = request.getContextPath() != null ? uri.substring(request.getContextPath().length()) : uri;
        return path.equals(PREFIX) || path.startsWith(PREFIX + "/");
    }
}
