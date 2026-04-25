package com.example.backend.repository;

import com.example.backend.domain.AppNotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppNotificationRepository extends JpaRepository<AppNotificationEntity, Long> {

    @Query("SELECT n FROM AppNotificationEntity n WHERE n.userId = :userId ORDER BY n.createdAt DESC")
    List<AppNotificationEntity> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT n FROM AppNotificationEntity n WHERE n.userId = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<AppNotificationEntity> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM AppNotificationEntity n WHERE n.userId = :userId AND n.isRead = false")
    long countByUserIdAndIsReadFalse(@Param("userId") Long userId);

    Optional<AppNotificationEntity> findByNotificationIdAndUserId(Long notificationId, Long userId);

    @Modifying
    @Query("update AppNotificationEntity n set n.isRead = true, n.readAt = :at where n.userId = :userId and n.isRead = false")
    int markAllReadForUser(@Param("userId") Long userId, @Param("at") LocalDateTime at);
}
