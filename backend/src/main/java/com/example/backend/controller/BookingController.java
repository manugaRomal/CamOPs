package com.example.backend.controller;

import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.BookingResponseDTO;
import com.example.backend.security.CamUserPrincipal;
import com.example.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String CANCELLED = "CANCELLED";

    private static final String ADMIN = "ADMIN";

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** Approve / triage all bookings: admins only. Technicians and students see only their own (when implemented). */
    private static boolean isAdmin(CamUserPrincipal p) {
        if (p == null) {
            return false;
        }
        return p.getRoleNames().stream().anyMatch(ADMIN::equals);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO bookingRequestDTO,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        bookingRequestDTO.setUserId(principal.getUserId());
        BookingResponseDTO createdBooking = bookingService.createBooking(bookingRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        List<BookingResponseDTO> bookings;
        if (isAdmin(principal)) {
            bookings = userId != null
                    ? bookingService.getUserBookings(userId)
                    : bookingService.getAllBookings();
        } else {
            bookings = bookingService.getUserBookings(principal.getUserId());
        }

        if (status != null && !status.isBlank()) {
            bookings = bookings.stream()
                    .filter(booking -> Objects.nonNull(booking.getStatus()) && booking.getStatus().equalsIgnoreCase(status))
                    .toList();
        }

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        BookingResponseDTO booking = bookingService.getBookingById(id);
        if (!isAdmin(principal) && !booking.getUserId().equals(principal.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable Long id,
            @RequestParam(required = false) Long reviewedBy,
            @RequestParam(required = false) String reviewReason,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        Long reviewer = reviewedBy != null ? reviewedBy : principal.getUserId();
        BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(id, APPROVED, reviewer, reviewReason);
        return ResponseEntity.ok(updatedBooking);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @RequestParam(required = false) Long reviewedBy,
            @RequestParam(required = false) String reviewReason,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        Long reviewer = reviewedBy != null ? reviewedBy : principal.getUserId();
        BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(id, REJECTED, reviewer, reviewReason);
        return ResponseEntity.ok(updatedBooking);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDTO> cancelBookingByStudent(
            @PathVariable Long id,
            @RequestParam(required = false) String cancelReason,
            @AuthenticationPrincipal CamUserPrincipal principal
    ) {
        BookingResponseDTO updatedBooking = bookingService.cancelBookingByStudent(
                id,
                principal.getUserId(),
                cancelReason
        );
        return ResponseEntity.ok(updatedBooking);
    }
}
