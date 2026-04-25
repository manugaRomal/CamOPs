package com.example.backend.service;

import com.example.backend.domain.AppNotificationEntity;
import com.example.backend.dto.NotificationResponseDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.AppNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final AppNotificationRepository notificationRepository;

    public NotificationServiceImpl(AppNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> listForUser(Long userId, boolean unreadOnly) {
        List<AppNotificationEntity> list = unreadOnly
                ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        AppNotificationEntity n = notificationRepository
                .findByNotificationIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (Boolean.TRUE.equals(n.getIsRead())) {
            return;
        }
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Override
    public int markAllRead(Long userId) {
        int updated = notificationRepository.markAllReadForUser(userId, LocalDateTime.now());
        return updated;
    }

    @Override
    public void create(Long userId, String type, String title, String message, Long relatedBookingId) {
        AppNotificationEntity n = new AppNotificationEntity();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);
        n.setRelatedBookingId(relatedBookingId);
        notificationRepository.save(n);
    }

    private NotificationResponseDTO toDto(AppNotificationEntity n) {
        NotificationResponseDTO d = new NotificationResponseDTO();
        d.setId(n.getNotificationId());
        d.setType(n.getType());
        d.setTitle(n.getTitle());
        d.setMessage(n.getMessage());
        d.setRead(n.getIsRead() != null && n.getIsRead());
        d.setReadAt(n.getReadAt());
        d.setRelatedBookingId(n.getRelatedBookingId());
        d.setRelatedTicketId(n.getRelatedTicketId());
        d.setCreatedAt(n.getCreatedAt());
        return d;
    }
}
