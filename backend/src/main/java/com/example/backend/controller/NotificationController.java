package com.example.backend.controller;

import com.example.backend.domain.AppNotificationEntity;
import com.example.backend.security.CamUserPrincipal;
import com.example.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public List<AppNotificationEntity> list(@AuthenticationPrincipal CamUserPrincipal principal) {
        return notificationService.listForUser(principal.getUserId());
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal CamUserPrincipal principal) {
        return Map.of("count", notificationService.countUnread(principal.getUserId()));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        notificationService.markRead(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Integer> markAllRead(@AuthenticationPrincipal CamUserPrincipal principal) {
        int n = notificationService.markAllRead(principal.getUserId());
        return Map.of("updated", n);
    }
}
