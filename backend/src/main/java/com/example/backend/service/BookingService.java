package com.example.backend.service;

import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO bookingRequestDTO);

    BookingResponseDTO updateBookingStatus(Long bookingId, String newStatus, Long reviewedBy, String reviewReason);

    List<BookingResponseDTO> getAllBookings();

    List<BookingResponseDTO> getUserBookings(Long userId);
}
