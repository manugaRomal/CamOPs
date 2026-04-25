package com.example.backend.repository;

import com.example.backend.domain.AppNotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppNotificationRepository extends JpaRepository<AppNotificationEntity, Long> {

    List<AppNotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("update AppNotificationEntity n set n.isRead = true, n.readAt = :at where n.userId = :userId and n.isRead = false")
    int markAllReadForUser(@Param("userId") Long userId, @Param("at") LocalDateTime at);

    long countByUserIdAndIsReadFalse(Long userId);
}
