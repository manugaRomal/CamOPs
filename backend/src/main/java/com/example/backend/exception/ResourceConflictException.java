package com.example.backend.exception;

import com.example.backend.dto.BookingConflictSuggestionDTO;

public class ResourceConflictException extends RuntimeException {

    private final BookingConflictSuggestionDTO suggestion;

    public ResourceConflictException(String message, BookingConflictSuggestionDTO suggestion) {
        super(message);
        this.suggestion = suggestion;
    }

    public BookingConflictSuggestionDTO getSuggestion() {
        return suggestion;
    }
}
