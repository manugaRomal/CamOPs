package com.example.backend.security;

import com.example.backend.config.AppProperties;
import com.example.backend.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtService {

    private final AppProperties appProperties;
    private final SecretKey key;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
        String secret = appProperties.getJwt().getSecret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 bytes for HS-256");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(User user) {
        long expMs = appProperties.getJwt().getExpirationMs();
        List<String> roles = user.getRoleLinks().stream()
                .map(ur -> ur.getRole().getRoleName())
                .toList();
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expMs))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long parseUserId(String token) {
        try {
            return Long.parseLong(parseClaims(token).getSubject());
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> parseRoles(String token) {
        Claims c = parseClaims(token);
        Object r = c.get("roles");
        if (r instanceof List<?> list) {
            return list.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .toList();
        }
        return List.of();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
