package com.example.backend.config;

import com.example.backend.security.CustomOAuth2UserService;
import com.example.backend.security.JwtAuthenticationFilter;
import com.example.backend.security.JsonAccessDeniedHandler;
import com.example.backend.security.JsonAuthenticationEntryPoint;
import com.example.backend.security.OAuth2LoginSuccessHandler;
import com.example.backend.security.ResourceReadRequestMatcher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            AppProperties appProperties,
            JsonAuthenticationEntryPoint jsonAuthenticationEntryPoint,
            JsonAccessDeniedHandler jsonAccessDeniedHandler
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(
                        appProperties.isPermitAll() ? SessionCreationPolicy.STATELESS : SessionCreationPolicy.IF_REQUIRED
                ))
                .exceptionHandling(ex -> {
                    ex.authenticationEntryPoint(jsonAuthenticationEntryPoint);
                    ex.accessDeniedHandler(jsonAccessDeniedHandler);
                })
                .authorizeHttpRequests(reg -> {
                    if (appProperties.isPermitAll()) {
                        reg.anyRequest().permitAll();
                    } else {
                        reg
                                .requestMatchers(
                                        "/oauth2/**",
                                        "/login/**",
                                        "/error"
                                ).permitAll()
                                .requestMatchers(new ResourceReadRequestMatcher()).permitAll()
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers(
                                        "/api/auth/login"
                                ).permitAll()
                                .anyRequest().authenticated();
                    }
                });

        if (!appProperties.isPermitAll()) {
            http.oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(u -> u.userService(customOAuth2UserService))
                    .successHandler(oAuth2LoginSuccessHandler)
            );
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("Authorization"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}
