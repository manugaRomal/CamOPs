package com.example.backend.controller;

import com.example.backend.dto.NotificationResponseDTO;
import com.example.backend.security.AuthPrincipal;
import com.example.backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<NotificationResponseDTO> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(name = "unreadOnly", defaultValue = "false") boolean unreadOnly
    ) {
        requireUser(principal);
        return notificationService.listForUser(principal.getUserId(), unreadOnly);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal AuthPrincipal principal) {
        requireUser(principal);
        return Map.of("count", notificationService.unreadCount(principal.getUserId()));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markRead(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable("id") Long id
    ) {
        requireUser(principal);
        notificationService.markAsRead(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Integer> markAllRead(@AuthenticationPrincipal AuthPrincipal principal) {
        requireUser(principal);
        int n = notificationService.markAllRead(principal.getUserId());
        return Map.of("updated", n);
    }

    private void requireUser(AuthPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        if (principal.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid user");
        }
    }
}
