package com.example.backend.security;

import com.example.backend.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final AppProperties appProperties;
    private final SecretKey key;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
        byte[] bytes = this.appProperties.getJwtSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(padTo256Bit(bytes));
    }

    private static byte[] padTo256Bit(byte[] secret) {
        if (secret.length >= 32) {
            if (secret.length > 32) {
                byte[] s = new byte[32];
                System.arraycopy(secret, 0, s, 0, 32);
                return s;
            }
            return secret;
        }
        byte[] padded = new byte[32];
        System.arraycopy(secret, 0, padded, 0, secret.length);
        for (int i = secret.length; i < 32; i++) {
            padded[i] = (byte) (i * 3 + 7);
        }
        return padded;
    }

    public String generateToken(Long userId, String email, String fullName, String profileImageUrl, List<String> roleNames) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + appProperties.getJwtExpirationMs());
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("name", fullName)
                .claim("picture", profileImageUrl)
                .claim("roles", String.join(",", roleNames))
                .issuedAt(now)
                .expiration(exp)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public boolean validate(String token) {
        try {
            parseAllClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public CamUserPrincipal toPrincipal(String token) {
        Claims c = parseAllClaims(token);
        long userId = Long.parseLong(c.getSubject());
        String email = c.get("email", String.class);
        String name = c.get("name", String.class);
        String picture = c.get("picture", String.class);
        String rolesCsv = c.get("roles", String.class);
        List<String> roles = rolesCsv == null || rolesCsv.isBlank() ? List.of() : List.of(rolesCsv.split(","));
        return new CamUserPrincipal(userId, email, name, picture, roles);
    }

    private Claims parseAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
