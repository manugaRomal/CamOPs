package com.example.backend.controller;

import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.BookingResponseDTO;
import com.example.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private static final String APPROVED = "APPROVED";
    private static final String CANCELLED = "CANCELLED";

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequestDTO) {
        BookingResponseDTO createdBooking = bookingService.createBooking(bookingRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status
    ) {
        List<BookingResponseDTO> bookings = userId != null
                ? bookingService.getUserBookings(userId)
                : bookingService.getAllBookings();

        if (status != null && !status.isBlank()) {
            bookings = bookings.stream()
                    .filter(booking -> Objects.nonNull(booking.getStatus()) && booking.getStatus().equalsIgnoreCase(status))
                    .toList();
        }

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        BookingResponseDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam Long reviewedBy,
            @RequestParam String reviewReason
    ) {
        BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(id, status, reviewedBy, reviewReason);
        return ResponseEntity.ok(updatedBooking);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable Long id,
            @RequestParam(required = false) Long reviewedBy,
            @RequestParam(required = false) String reviewReason
    ) {
        BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(id, APPROVED, reviewedBy, reviewReason);
        return ResponseEntity.ok(updatedBooking);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) Long reviewedBy,
            @RequestParam(required = false) String reviewReason
    ) {
        BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(id, CANCELLED, reviewedBy, reviewReason);
        return ResponseEntity.ok(updatedBooking);
    }
}
