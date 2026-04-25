package com.example.backend.controller;

import com.example.backend.dto.AdminNotificationItemDTO;
import com.example.backend.dto.admin.BroadcastNotificationRequest;
import com.example.backend.dto.admin.BroadcastResponse;
import com.example.backend.dto.admin.UpdateAdminNotificationRequest;
import com.example.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AdminNotificationItemDTO> list(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return notificationService.listForAdmin(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminNotificationItemDTO get(@PathVariable("id") long id) {
        return notificationService.getByIdForAdmin(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public BroadcastResponse broadcast(@Valid @RequestBody BroadcastNotificationRequest body) {
        String type = body.getType() != null && !body.getType().isBlank()
                ? body.getType().trim()
                : NotificationService.TYPE_ANNOUNCEMENT;
        return notificationService.broadcastToUsers(
                type,
                body.getTitle().trim(),
                body.getMessage().trim(),
                body.getRecipientUserIds()
        );
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateOne(
            @PathVariable("id") long id,
            @Valid @RequestBody UpdateAdminNotificationRequest body
    ) {
        if (body.getTitle() != null) {
            body.setTitle(body.getTitle().trim());
        }
        if (body.getMessage() != null) {
            body.setMessage(body.getMessage().trim());
        }
        if (body.getType() != null) {
            body.setType(body.getType().trim());
        }
        notificationService.updateByIdForAdmin(id, body);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/batch/{batchId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Integer> updateBatch(
            @PathVariable("batchId") String batchId,
            @Valid @RequestBody UpdateAdminNotificationRequest body
    ) {
        if (body.getTitle() != null) {
            body.setTitle(body.getTitle().trim());
        }
        if (body.getMessage() != null) {
            body.setMessage(body.getMessage().trim());
        }
        if (body.getType() != null) {
            body.setType(body.getType().trim());
        }
        int updated = notificationService.updateByBatchId(batchId, body);
        return Map.of("updated", updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOne(@PathVariable("id") long id) {
        notificationService.deleteByIdForAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/batch/{batchId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Integer> deleteBatch(@PathVariable("batchId") String batchId) {
        int n = notificationService.deleteByBatchId(batchId);
        return Map.of("deleted", n);
    }
}
