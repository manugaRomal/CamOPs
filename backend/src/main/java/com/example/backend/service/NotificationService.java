package com.example.backend.service;

import com.example.backend.dto.AdminNotificationItemDTO;
import com.example.backend.dto.NotificationResponseDTO;
import com.example.backend.dto.admin.BroadcastResponse;
import com.example.backend.dto.admin.UpdateAdminNotificationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;

public interface NotificationService {

    String TYPE_BOOKING_SUBMITTED = "BOOKING_SUBMITTED";
    String TYPE_BOOKING_APPROVED = "BOOKING_APPROVED";
    String TYPE_BOOKING_REJECTED = "BOOKING_REJECTED";
    String TYPE_BOOKING_CANCELLED = "BOOKING_CANCELLED";
    String TYPE_BOOKING = "BOOKING";
    String TYPE_ANNOUNCEMENT = "ANNOUNCEMENT";

    List<NotificationResponseDTO> listForUser(Long userId, boolean unreadOnly);

    long unreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    int markAllRead(Long userId);

    void create(Long userId, String type, String title, String message, Long relatedBookingId);

    /**
     * One row per recipient. If {@code recipientUserIds} is null or empty, all user accounts are notified.
     * Otherwise only the given ids (must all exist).
     */
    BroadcastResponse broadcastToUsers(String type, String title, String message, Collection<Long> recipientUserIds);

    Page<AdminNotificationItemDTO> listForAdmin(Pageable pageable);

    AdminNotificationItemDTO getByIdForAdmin(long notificationId);

    void updateByIdForAdmin(long notificationId, UpdateAdminNotificationRequest request);

    int updateByBatchId(String batchId, UpdateAdminNotificationRequest request);

    void deleteByIdForAdmin(long notificationId);

    int deleteByBatchId(String batchId);
}
