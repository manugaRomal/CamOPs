package com.example.backend.controller.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ResourceHealthResponse {

    private int score;
    private String label;
    private String resourceStatus;
    private long openTicketCount;
    private long urgentOpenTicketCount;
    private long totalTicketCount;
    private List<String> factors = new ArrayList<>();

    public ResourceHealthResponse() {}

    public ResourceHealthResponse(
            int score,
            String label,
            String resourceStatus,
            long openTicketCount,
            long urgentOpenTicketCount,
            long totalTicketCount,
            List<String> factors
    ) {
        this.score = score;
        this.label = label;
        this.resourceStatus = resourceStatus;
        this.openTicketCount = openTicketCount;
        this.urgentOpenTicketCount = urgentOpenTicketCount;
        this.totalTicketCount = totalTicketCount;
        this.factors = factors != null ? new ArrayList<>(factors) : new ArrayList<>();
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getResourceStatus() {
        return resourceStatus;
    }

    public void setResourceStatus(String resourceStatus) {
        this.resourceStatus = resourceStatus;
    }

    public long getOpenTicketCount() {
        return openTicketCount;
    }

    public void setOpenTicketCount(long openTicketCount) {
        this.openTicketCount = openTicketCount;
    }

    public long getUrgentOpenTicketCount() {
        return urgentOpenTicketCount;
    }

    public void setUrgentOpenTicketCount(long urgentOpenTicketCount) {
        this.urgentOpenTicketCount = urgentOpenTicketCount;
    }

    public long getTotalTicketCount() {
        return totalTicketCount;
    }

    public void setTotalTicketCount(long totalTicketCount) {
        this.totalTicketCount = totalTicketCount;
    }

    public List<String> getFactors() {
        return Collections.unmodifiableList(factors);
    }

    public void setFactors(List<String> factors) {
        this.factors = factors != null ? new ArrayList<>(factors) : new ArrayList<>();
    }
}
