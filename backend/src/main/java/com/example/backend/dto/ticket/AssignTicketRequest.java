package com.example.backend.dto.ticket;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {

    @NotNull
    private Long assignedToUserId;

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }
}
