package com.example.backend.service;

import com.example.backend.dto.NotificationResponseDTO;

import java.util.List;

public interface NotificationService {

    String TYPE_BOOKING_SUBMITTED = "BOOKING_SUBMITTED";
    String TYPE_BOOKING_APPROVED = "BOOKING_APPROVED";
    String TYPE_BOOKING_REJECTED = "BOOKING_REJECTED";
    String TYPE_BOOKING_CANCELLED = "BOOKING_CANCELLED";
    String TYPE_BOOKING = "BOOKING";

    List<NotificationResponseDTO> listForUser(Long userId, boolean unreadOnly);

    long unreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    int markAllRead(Long userId);

    void create(Long userId, String type, String title, String message, Long relatedBookingId);
}
