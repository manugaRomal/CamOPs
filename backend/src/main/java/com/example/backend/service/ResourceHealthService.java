package com.example.backend.service;

import com.example.backend.controller.dto.ResourceHealthResponse;
import com.example.backend.domain.Resource;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ResourceRepository;
import com.example.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResourceHealthService {

    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;

    public ResourceHealthService(ResourceRepository resourceRepository, TicketRepository ticketRepository) {
        this.resourceRepository = resourceRepository;
        this.ticketRepository = ticketRepository;
    }

    /**
     * Health score 0–100 from operational status and linked incident tickets.
     * Penalties are capped so a single dimension cannot zero the score alone.
     */
    public ResourceHealthResponse computeHealth(Long resourceId) {
        Resource resource = resourceRepository
                .findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        String status = resource.getStatus() != null ? resource.getStatus().trim().toUpperCase() : "UNKNOWN";

        long openCount = ticketRepository.countOpenOrInProgressByResourceId(resourceId);
        long urgentOpen = ticketRepository.countUrgentOpenByResourceId(resourceId);
        long totalTickets = ticketRepository.countByResourceId(resourceId);

        int score = 100;
        List<String> factors = new ArrayList<>();

        int statusPenalty = statusPenalty(status);
        if (statusPenalty > 0) {
            score -= statusPenalty;
            factors.add("Resource status is " + status + " (-" + statusPenalty + ")");
        }

        int openPenalty = (int) Math.min(openCount * 12, 36);
        if (openPenalty > 0) {
            score -= openPenalty;
            factors.add(openCount + " open or in-progress ticket(s) (-" + openPenalty + ")");
        }

        int urgentPenalty = (int) Math.min(urgentOpen * 15, 30);
        if (urgentPenalty > 0) {
            score -= urgentPenalty;
            factors.add(urgentOpen + " high/critical open ticket(s) (-" + urgentPenalty + ")");
        }

        int historyPenalty = (int) Math.min(totalTickets * 2, 10);
        if (historyPenalty > 0 && totalTickets > 0) {
            score -= historyPenalty;
            factors.add("Total incident history: " + totalTickets + " ticket(s) (-" + historyPenalty + ")");
        }

        score = Math.max(0, Math.min(100, score));

        String label;
        if (score >= 80) {
            label = "Healthy";
        } else if (score >= 55) {
            label = "At risk";
        } else {
            label = "Critical";
        }

        if (factors.isEmpty()) {
            factors.add("No significant penalties applied");
        }

        ResourceHealthResponse response = new ResourceHealthResponse();
        response.setScore(score);
        response.setLabel(label);
        response.setResourceStatus(status);
        response.setOpenTicketCount(openCount);
        response.setUrgentOpenTicketCount(urgentOpen);
        response.setTotalTicketCount(totalTickets);
        response.setFactors(factors);
        return response;
    }

    private int statusPenalty(String statusUpper) {
        return switch (statusUpper) {
            case "ACTIVE" -> 0;
            case "INACTIVE" -> 10;
            case "MAINTENANCE" -> 20;
            case "OUT_OF_SERVICE" -> 35;
            default -> 15;
        };
    }
}
