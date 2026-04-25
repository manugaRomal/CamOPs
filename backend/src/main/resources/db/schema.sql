/* ============================================================
   CamOPs - Database Schema (MySQL 8+)
   ============================================================ */

SET FOREIGN_KEY_CHECKS = 0;

/* Drop tables (order matters) */
DROP TABLE IF EXISTS Ticket_attachment;
DROP TABLE IF EXISTS Ticket_comment;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Ticket;
DROP TABLE IF EXISTS Resources;
DROP TABLE IF EXISTS User_Role;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

/* ============================================================
   1) Users
   ============================================================ */
CREATE TABLE Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    department VARCHAR(100),
    profile_image_url VARCHAR(500),
    google_sub VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ============================================================
   2) Roles
   ============================================================ */
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

/* ============================================================
   3) User_Role
   ============================================================ */
CREATE TABLE User_Role (
    user_role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    UNIQUE (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE
);

/* ============================================================
   4) Resources
   ============================================================ */
CREATE TABLE Resources (
    resource_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_code VARCHAR(50) NOT NULL UNIQUE,
    resource_name VARCHAR(150) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    location VARCHAR(255),
    capacity INT,
    resource_image VARCHAR(500),
    availability_start_time TIME,
    availability_end_time TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ============================================================
   5) Ticket
   ============================================================ */
CREATE TABLE Ticket (
    ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    resource_id BIGINT,
    category VARCHAR(80) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(30) DEFAULT 'OPEN',
    description TEXT NOT NULL,
    preferred_contact VARCHAR(50),
    resolution_notes TEXT,
    rejection_reason VARCHAR(500),
    resolved_at DATETIME,
    closed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (resource_id) REFERENCES Resources(resource_id)
);

/* ============================================================
   6) Ticket_comment
   ============================================================ */
CREATE TABLE Ticket_comment (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

/* ============================================================
   7) Ticket_attachment
   ============================================================ */
CREATE TABLE Ticket_attachment (
    attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE
);

/* ============================================================
   8) Bookings
   ============================================================ */
CREATE TABLE Bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    expected_attendees INT,
    status VARCHAR(30) DEFAULT 'PENDING',
    approved_at DATETIME,
    reviewed_by BIGINT,
    review_reasons VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (end_time > start_time),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (resource_id) REFERENCES Resources(resource_id),
    FOREIGN KEY (reviewed_by) REFERENCES Users(user_id)
);

/* ============================================================
   9) Notification
   ============================================================ */
CREATE TABLE Notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    related_ticket_id BIGINT,
    related_booking_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_ticket_id) REFERENCES Ticket(ticket_id),
    FOREIGN KEY (related_booking_id) REFERENCES Bookings(booking_id)
);

/* ============================================================
   Indexes
   ============================================================ */
CREATE INDEX IX_User_Role_user ON User_Role(user_id);
CREATE INDEX IX_User_Role_role ON User_Role(role_id);

CREATE INDEX IX_Ticket_user ON Ticket(user_id);
CREATE INDEX IX_Ticket_resource ON Ticket(resource_id);
CREATE INDEX IX_Ticket_status ON Ticket(status);
CREATE INDEX IX_Ticket_created_at ON Ticket(created_at);

CREATE INDEX IX_Ticket_comment_ticket ON Ticket_comment(ticket_id);
CREATE INDEX IX_Ticket_comment_user ON Ticket_comment(user_id);

CREATE INDEX IX_Ticket_attachment_ticket ON Ticket_attachment(ticket_id);

CREATE INDEX IX_Bookings_user ON Bookings(user_id);
CREATE INDEX IX_Bookings_resource ON Bookings(resource_id);
CREATE INDEX IX_Bookings_date ON Bookings(booking_date);
CREATE INDEX IX_Bookings_status ON Bookings(status);

CREATE INDEX IX_Notification_user_unread ON Notification(user_id, is_read);
CREATE INDEX IX_Notification_created_at ON Notification(created_at);

/* ============================================================
   Seed Data
   ============================================================ */
INSERT INTO Roles (role_name) VALUES
    ('ADMIN'),
    ('TECHNICIAN'),
    ('STUDENT');

ALTER TABLE Resources
MODIFY status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') DEFAULT 'ACTIVE';


