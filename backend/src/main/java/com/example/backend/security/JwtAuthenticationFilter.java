package com.example.backend.security;

import com.example.backend.config.AppProperties;
import com.example.backend.domain.User;
import com.example.backend.domain.UserRoleLink;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository, AppProperties appProperties) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (appProperties.getSecurity().isPermitAll()) {
            filterChain.doFilter(request, response);
            return;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        if (!jwtService.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        Long userId = jwtService.parseUserId(token);
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || !user.isActive()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        List<SimpleGrantedAuthority> authorities = user.getRoleLinks().stream()
                .map(UserRoleLink::getRole)
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
                .collect(Collectors.toList());
        var auth = new UsernamePasswordAuthenticationToken(
                new AuthPrincipal(user.getId(), user.getEmail()),
                null,
                authorities
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }
}
