package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BookingConflictSuggestionDTO {

    private LocalDateTime suggestedStartTime;
    private LocalDateTime suggestedEndTime;
    private List<AlternativeResourceSuggestionDTO> alternativeResources;

    public LocalDateTime getSuggestedStartTime() {
        return suggestedStartTime;
    }

    public void setSuggestedStartTime(LocalDateTime suggestedStartTime) {
        this.suggestedStartTime = suggestedStartTime;
    }

    public LocalDateTime getSuggestedEndTime() {
        return suggestedEndTime;
    }

    public void setSuggestedEndTime(LocalDateTime suggestedEndTime) {
        this.suggestedEndTime = suggestedEndTime;
    }

    public List<AlternativeResourceSuggestionDTO> getAlternativeResources() {
        return alternativeResources;
    }

    public void setAlternativeResources(List<AlternativeResourceSuggestionDTO> alternativeResources) {
        this.alternativeResources = alternativeResources;
    }
}
