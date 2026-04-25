package com.example.backend.dto.admin;

public class BroadcastResponse {
    private final String batchId;
    private final int recipientCount;

    public BroadcastResponse(String batchId, int recipientCount) {
        this.batchId = batchId;
        this.recipientCount = recipientCount;
    }

    public String getBatchId() {
        return batchId;
    }

    public int getRecipientCount() {
        return recipientCount;
    }
}
