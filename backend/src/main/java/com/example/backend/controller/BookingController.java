package com.example.backend.controller;

import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.BookingResponseDTO;
import com.example.backend.security.AuthPrincipal;
import com.example.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String CANCELLED = "CANCELLED";

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** Approve / triage all bookings: admins only. Technicians and students see only their own (when implemented). */
    private static boolean isAdmin(Authentication auth) {
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO bookingRequestDTO,
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        bookingRequestDTO.setUserId(principal.getUserId());
        BookingResponseDTO createdBooking = bookingService.createBooking(bookingRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        List<BookingResponseDTO> bookings;
        if (isAdmin(authentication)) {
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
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        BookingResponseDTO booking = bookingService.getBookingById(id);
        if (!isAdmin(authentication) && !booking.getUserId().equals(principal.getUserId())) {
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
            @AuthenticationPrincipal AuthPrincipal principal
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
            @AuthenticationPrincipal AuthPrincipal principal
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
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        BookingResponseDTO updatedBooking = bookingService.cancelBookingByStudent(
                id,
                principal.getUserId(),
                cancelReason
        );
        return ResponseEntity.ok(updatedBooking);
    }
}
