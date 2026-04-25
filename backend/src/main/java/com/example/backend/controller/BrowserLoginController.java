package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Spring Security and browsers often use {@code /login} as the entry; we only use Google OAuth.
 * Without this mapping, {@code GET /login} was handled as a static file and failed with
 * {@code NoResourceFoundException}. Redirecting starts the standard OAuth2 flow.
 */
@Controller
public class BrowserLoginController {

    @GetMapping("/login")
    public String login() {
        return "redirect:/oauth2/authorization/google";
    }
}
