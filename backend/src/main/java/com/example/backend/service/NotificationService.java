package com.example.backend.service;

import com.example.backend.domain.AppNotificationEntity;
import com.example.backend.repository.AppNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    public static final String TYPE_BOOKING = "BOOKING";

    private final AppNotificationRepository notificationRepository;

    public NotificationService(AppNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<AppNotificationEntity> listForUser(long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countUnread(long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markRead(long notificationId, long userId) {
        AppNotificationEntity n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalStateException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new IllegalStateException("Cannot modify another user's notification");
        }
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    public int markAllRead(long userId) {
        return notificationRepository.markAllReadForUser(userId, LocalDateTime.now());
    }

    public void notifyUser(long userId, String type, String title, String message, Long relatedBookingId, Long relatedTicketId) {
        AppNotificationEntity n = new AppNotificationEntity();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);
        n.setRelatedBookingId(relatedBookingId);
        n.setRelatedTicketId(relatedTicketId);
        notificationRepository.save(n);
    }

    public void notifyBookingDecision(long userId, long bookingId, String newStatus) {
        String title = "Booking " + newStatus;
        String message = "Your booking #" + bookingId + " is now " + newStatus + ".";
        notifyUser(userId, TYPE_BOOKING, title, message, bookingId, null);
    }
}
