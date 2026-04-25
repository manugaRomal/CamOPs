package com.example.backend.dto;

import java.time.LocalDateTime;

/**
 * One notification row in the admin list (includes recipient).
 */
public class AdminNotificationItemDTO {

    private final Long id;
    private final Long userId;
    private final String userEmail;
    private final String type;
    private final String title;
    private final String message;
    private final boolean read;
    private final LocalDateTime createdAt;
    private final String batchId;

    public AdminNotificationItemDTO(
            Long id,
            Long userId,
            String userEmail,
            String type,
            String title,
            String message,
            Boolean isRead,
            LocalDateTime createdAt,
            String batchId
    ) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = Boolean.TRUE.equals(isRead);
        this.createdAt = createdAt;
        this.batchId = batchId;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getBatchId() {
        return batchId;
    }
}
