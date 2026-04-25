package com.example.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BroadcastNotificationRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String message;

    /** If omitted, {@link com.example.backend.service.NotificationService#TYPE_ANNOUNCEMENT} is used. */
    @Size(max = 50)
    private String type;

    /**
     * If null or empty, the message is sent to every user account.
     * If non-empty, only these user ids receive the notification (same batch id).
     */
    private List<Long> recipientUserIds;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Long> getRecipientUserIds() {
        return recipientUserIds;
    }

    public void setRecipientUserIds(List<Long> recipientUserIds) {
        this.recipientUserIds = recipientUserIds;
    }
}
