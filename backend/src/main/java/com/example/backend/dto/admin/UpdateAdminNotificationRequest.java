package com.example.backend.dto.admin;

import jakarta.validation.constraints.Size;

public class UpdateAdminNotificationRequest {

    @Size(max = 200)
    private String title;

    @Size(max = 10000)
    private String message;

    @Size(max = 50)
    private String type;

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

    public boolean isEmpty() {
        return title == null && message == null && type == null;
    }
}
