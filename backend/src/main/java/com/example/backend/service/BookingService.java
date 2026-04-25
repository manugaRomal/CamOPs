package com.example.backend.service;

import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO bookingRequestDTO);

    BookingResponseDTO getBookingById(Long bookingId);

    BookingResponseDTO updateBookingStatus(Long bookingId, String newStatus, Long reviewedBy, String reviewReason);

    BookingResponseDTO cancelBookingByStudent(Long bookingId, Long studentUserId, String cancelReason);

    List<BookingResponseDTO> getAllBookings();

    List<BookingResponseDTO> getUserBookings(Long userId);
}
