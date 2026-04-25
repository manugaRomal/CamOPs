package com.example.backend.dto.ticket;

import jakarta.validation.constraints.NotBlank;

public class AddTicketCommentRequest {

    @NotBlank
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
