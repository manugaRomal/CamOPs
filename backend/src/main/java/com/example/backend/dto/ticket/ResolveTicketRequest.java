package com.example.backend.dto.ticket;

import jakarta.validation.constraints.NotBlank;

public class ResolveTicketRequest {

    @NotBlank
    private String resolutionNotes;

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
