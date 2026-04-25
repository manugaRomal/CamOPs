package com.example.backend.service;

import com.example.backend.domain.AppNotificationEntity;
import com.example.backend.domain.User;
import com.example.backend.dto.AdminNotificationItemDTO;
import com.example.backend.dto.NotificationResponseDTO;
import com.example.backend.dto.admin.BroadcastResponse;
import com.example.backend.dto.admin.UpdateAdminNotificationRequest;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.AppNotificationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final AppNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(
            AppNotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
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
        AppNotificationEntity n = newBaseRow(userId, type, title, message, null);
        n.setRelatedBookingId(relatedBookingId);
        notificationRepository.save(n);
    }

    @Override
    public BroadcastResponse broadcastToUsers(String type, String title, String message, Collection<Long> recipientUserIds) {
        List<User> users;
        if (recipientUserIds == null || recipientUserIds.isEmpty()) {
            users = userRepository.findAll();
        } else {
            LinkedHashSet<Long> unique = new LinkedHashSet<>(recipientUserIds);
            users = new ArrayList<>();
            for (Long id : unique) {
                if (id == null) {
                    throw new BadRequestException("recipientUserIds cannot contain null");
                }
                User u = userRepository.findById(id)
                        .orElseThrow(() -> new BadRequestException("Unknown user id: " + id));
                users.add(u);
            }
        }
        if (users.isEmpty()) {
            return new BroadcastResponse(null, 0);
        }
        String batchId = UUID.randomUUID().toString();
        for (User u : users) {
            AppNotificationEntity n = newBaseRow(u.getId(), type, title, message, batchId);
            notificationRepository.save(n);
        }
        return new BroadcastResponse(batchId, users.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminNotificationItemDTO> listForAdmin(Pageable pageable) {
        return notificationRepository.findAllForAdminPaged(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminNotificationItemDTO getByIdForAdmin(long notificationId) {
        AppNotificationEntity n = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        User u = userRepository
                .findById(n.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new AdminNotificationItemDTO(
                n.getNotificationId(),
                n.getUserId(),
                u.getEmail(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getIsRead(),
                n.getCreatedAt(),
                n.getBatchId()
        );
    }

    @Override
    public void updateByIdForAdmin(long notificationId, UpdateAdminNotificationRequest request) {
        if (request.isEmpty()) {
            throw new BadRequestException("Nothing to update");
        }
        AppNotificationEntity n = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (request.getTitle() != null) {
            n.setTitle(request.getTitle());
        }
        if (request.getMessage() != null) {
            n.setMessage(request.getMessage());
        }
        if (request.getType() != null) {
            n.setType(request.getType());
        }
        notificationRepository.save(n);
    }

    @Override
    public int updateByBatchId(String batchId, UpdateAdminNotificationRequest request) {
        if (batchId == null || batchId.isBlank()) {
            throw new BadRequestException("batchId is required");
        }
        if (request.isEmpty()) {
            throw new BadRequestException("Nothing to update");
        }
        AppNotificationEntity one = notificationRepository
                .findFirstByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("No notifications for this batch"));
        String type = request.getType() != null ? request.getType() : one.getType();
        String title = request.getTitle() != null ? request.getTitle() : one.getTitle();
        String message = request.getMessage() != null ? request.getMessage() : one.getMessage();
        return notificationRepository.updateContentByBatchId(batchId, type, title, message);
    }

    @Override
    public void deleteByIdForAdmin(long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public int deleteByBatchId(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            throw new BadRequestException("batchId is required");
        }
        int n = notificationRepository.deleteByBatchId(batchId);
        if (n == 0) {
            throw new ResourceNotFoundException("No notifications for this batch");
        }
        return n;
    }

    private static AppNotificationEntity newBaseRow(
            Long userId,
            String type,
            String title,
            String message,
            String batchId
    ) {
        AppNotificationEntity n = new AppNotificationEntity();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);
        n.setBatchId(batchId);
        return n;
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
