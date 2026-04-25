-- CamOps: in-app notifications (JPA: AppNotificationEntity, table "notification").
-- Safe to re-run. Only FKs to Users so this runs even if other tables are not yet present.
-- In MySQL, look for: notification (lowercase) under schema camops_db
CREATE TABLE IF NOT EXISTS notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME(6),
    related_ticket_id BIGINT,
    related_booking_id BIGINT,
    batch_id VARCHAR(36),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    INDEX ix_notification_user_unread (user_id, is_read),
    INDEX ix_notification_created_at (created_at),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
