package com.example.backend.repository;

import com.example.backend.domain.AppNotificationEntity;
import com.example.backend.dto.AdminNotificationItemDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query(
            "SELECT n FROM AppNotificationEntity n WHERE n.userId = :userId AND (n.isRead = false OR n.isRead IS NULL) "
                    + "ORDER BY n.createdAt DESC"
    )
    List<AppNotificationEntity> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query(
            "SELECT COUNT(n) FROM AppNotificationEntity n WHERE n.userId = :userId AND (n.isRead = false OR n.isRead IS NULL)"
    )
    long countByUserIdAndIsReadFalse(@Param("userId") Long userId);

    Optional<AppNotificationEntity> findByNotificationIdAndUserId(Long notificationId, Long userId);

    @Modifying
    @Query(
            "update AppNotificationEntity n set n.isRead = true, n.readAt = :at "
                    + "where n.userId = :userId and (n.isRead = false or n.isRead is null)"
    )
    int markAllReadForUser(@Param("userId") Long userId, @Param("at") LocalDateTime at);

    @Query(
            "select new com.example.backend.dto.AdminNotificationItemDTO(n.notificationId, n.userId, u.email, n.type, "
                    + "n.title, n.message, n.isRead, n.createdAt, n.batchId) "
                    + "from AppNotificationEntity n join User u on n.userId = u.id order by n.createdAt desc"
    )
    Page<AdminNotificationItemDTO> findAllForAdminPaged(Pageable pageable);

    long countByBatchId(String batchId);

    Optional<AppNotificationEntity> findFirstByBatchId(String batchId);

    @Modifying
    @Query("update AppNotificationEntity n set n.title = :title, n.message = :message, n.type = :type where n.batchId = :batchId")
    int updateContentByBatchId(
            @Param("batchId") String batchId,
            @Param("type") String type,
            @Param("title") String title,
            @Param("message") String message
    );

    @Modifying
    @Query("delete from AppNotificationEntity n where n.batchId = :batchId")
    int deleteByBatchId(@Param("batchId") String batchId);
}
