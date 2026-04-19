/* ============================================================
   CamOPs - Database Schema (Microsoft SQL Server)
   Generated from the ER diagram.
   Engine: MSSQL (T-SQL)
   ============================================================ */

/* ------------------------------------------------------------
   Drop existing objects (in reverse FK order) for re-runs
   ------------------------------------------------------------ */
DROP TABLE IF EXISTS dbo.Ticket_attachment;
DROP TABLE IF EXISTS dbo.Ticket_comment;
DROP TABLE IF EXISTS dbo.Notification;
DROP TABLE IF EXISTS dbo.Bookings;
DROP TABLE IF EXISTS dbo.Ticket;
DROP TABLE IF EXISTS dbo.Resources;
DROP TABLE IF EXISTS dbo.User_Role;
DROP TABLE IF EXISTS dbo.Roles;
DROP TABLE IF EXISTS dbo.Users;

/* ============================================================
   1) Users
   ============================================================ */
CREATE TABLE dbo.Users (
    user_id            BIGINT          IDENTITY(1,1) NOT NULL,
    full_name          NVARCHAR(150)   NOT NULL,
    email              NVARCHAR(255)   NOT NULL,
    phone              NVARCHAR(30)    NULL,
    department         NVARCHAR(100)   NULL,
    profile_image_url  NVARCHAR(500)   NULL,
    google_sub         NVARCHAR(255)   NULL,   -- google_sub / oauth_id
    is_active          BIT             NOT NULL CONSTRAINT DF_Users_is_active     DEFAULT (1),
    created_at         DATETIME2(0)    NOT NULL CONSTRAINT DF_Users_created_at    DEFAULT (SYSUTCDATETIME()),
    updated_at         DATETIME2(0)    NOT NULL CONSTRAINT DF_Users_updated_at    DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Users         PRIMARY KEY (user_id),
    CONSTRAINT UQ_Users_email   UNIQUE (email),
    CONSTRAINT UQ_Users_google  UNIQUE (google_sub)
);

/* ============================================================
   2) Roles
   ============================================================ */
CREATE TABLE dbo.Roles (
    role_id    INT           IDENTITY(1,1) NOT NULL,
    role_name  NVARCHAR(50)  NOT NULL,
    CONSTRAINT PK_Roles            PRIMARY KEY (role_id),
    CONSTRAINT UQ_Roles_role_name  UNIQUE (role_name)
);

/* ============================================================
   3) User_Role (junction: Users <-> Roles, many-to-many)
   ============================================================ */
CREATE TABLE dbo.User_Role (
    user_role_id  BIGINT  IDENTITY(1,1) NOT NULL,
    user_id       BIGINT  NOT NULL,
    role_id       INT     NOT NULL,
    CONSTRAINT PK_User_Role          PRIMARY KEY (user_role_id),
    CONSTRAINT UQ_User_Role_pair     UNIQUE (user_id, role_id),
    CONSTRAINT FK_User_Role_User     FOREIGN KEY (user_id) REFERENCES dbo.Users (user_id) ON DELETE CASCADE,
    CONSTRAINT FK_User_Role_Role     FOREIGN KEY (role_id) REFERENCES dbo.Roles (role_id) ON DELETE CASCADE
);

/* ============================================================
   4) Resources
   (named in plural to avoid the reserved word "Resource")
   ============================================================ */
CREATE TABLE dbo.Resources (
    resource_id              BIGINT          IDENTITY(1,1) NOT NULL,
    resource_code            NVARCHAR(50)    NOT NULL,
    resource_name            NVARCHAR(150)   NOT NULL,
    resource_type            NVARCHAR(50)    NOT NULL,        -- e.g. ROOM, EQUIPMENT, VEHICLE
    description              NVARCHAR(1000)  NULL,
    status                   NVARCHAR(30)    NOT NULL CONSTRAINT DF_Resource_status DEFAULT ('AVAILABLE'),
    location                 NVARCHAR(255)   NULL,
    capacity                 INT             NULL,
    resource_image           NVARCHAR(500)   NULL,            -- image_url / resource_image
    availability_start_time  TIME(0)         NULL,
    availability_end_time    TIME(0)         NULL,
    created_at               DATETIME2(0)    NOT NULL CONSTRAINT DF_Resource_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at               DATETIME2(0)    NOT NULL CONSTRAINT DF_Resource_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Resource           PRIMARY KEY (resource_id),
    CONSTRAINT UQ_Resource_code      UNIQUE (resource_code)
);

/* ============================================================
   5) Ticket
   - created by a User
   - reports against a Resource (optional)
   ============================================================ */
CREATE TABLE dbo.Ticket (
    ticket_id          BIGINT          IDENTITY(1,1) NOT NULL,
    ticket_code        NVARCHAR(50)    NOT NULL,
    user_id            BIGINT          NOT NULL,           -- creator
    resource_id        BIGINT          NULL,               -- reported resource
    category           NVARCHAR(80)    NOT NULL,
    priority           NVARCHAR(20)    NOT NULL CONSTRAINT DF_Ticket_priority DEFAULT ('MEDIUM'),
    status             NVARCHAR(30)    NOT NULL CONSTRAINT DF_Ticket_status   DEFAULT ('OPEN'),
    description        NVARCHAR(MAX)   NOT NULL,
    preferred_contact  NVARCHAR(50)    NULL,               -- EMAIL / PHONE / etc.
    resolution_notes   NVARCHAR(MAX)   NULL,
    rejection_reason   NVARCHAR(500)   NULL,
    resolved_at        DATETIME2(0)    NULL,
    closed_at          DATETIME2(0)    NULL,
    created_at         DATETIME2(0)    NOT NULL CONSTRAINT DF_Ticket_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at         DATETIME2(0)    NOT NULL CONSTRAINT DF_Ticket_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Ticket             PRIMARY KEY (ticket_id),
    CONSTRAINT UQ_Ticket_code        UNIQUE (ticket_code),
    CONSTRAINT FK_Ticket_User        FOREIGN KEY (user_id)     REFERENCES dbo.Users    (user_id),
    CONSTRAINT FK_Ticket_Resource    FOREIGN KEY (resource_id) REFERENCES dbo.Resources (resource_id)
);

/* ============================================================
   6) Ticket_comment
   ============================================================ */
CREATE TABLE dbo.Ticket_comment (
    comment_id     BIGINT         IDENTITY(1,1) NOT NULL,
    ticket_id      BIGINT         NOT NULL,
    user_id        BIGINT         NOT NULL,        -- author
    comment_text   NVARCHAR(MAX)  NOT NULL,
    is_edited      BIT            NOT NULL CONSTRAINT DF_Ticket_comment_is_edited DEFAULT (0),
    created_at     DATETIME2(0)   NOT NULL CONSTRAINT DF_Ticket_comment_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at     DATETIME2(0)   NOT NULL CONSTRAINT DF_Ticket_comment_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Ticket_comment            PRIMARY KEY (comment_id),
    CONSTRAINT FK_Ticket_comment_Ticket     FOREIGN KEY (ticket_id) REFERENCES dbo.Ticket (ticket_id) ON DELETE CASCADE,
    CONSTRAINT FK_Ticket_comment_User       FOREIGN KEY (user_id)   REFERENCES dbo.Users  (user_id)
);

/* ============================================================
   7) Ticket_attachment
   ============================================================ */
CREATE TABLE dbo.Ticket_attachment (
    attachment_id  BIGINT         IDENTITY(1,1) NOT NULL,
    ticket_id      BIGINT         NOT NULL,
    file_name      NVARCHAR(255)  NOT NULL,
    file_type      NVARCHAR(100)  NULL,
    file_path      NVARCHAR(500)  NOT NULL,        -- file_url / file_path
    file_size      BIGINT         NULL,            -- bytes
    uploaded_at    DATETIME2(0)   NOT NULL CONSTRAINT DF_Ticket_attachment_uploaded_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Ticket_attachment        PRIMARY KEY (attachment_id),
    CONSTRAINT FK_Ticket_attachment_Ticket FOREIGN KEY (ticket_id) REFERENCES dbo.Ticket (ticket_id) ON DELETE CASCADE
);

/* ============================================================
   8) Bookings
   - created by a User
   - books a Resource
   ============================================================ */
CREATE TABLE dbo.Bookings (
    booking_id          BIGINT          IDENTITY(1,1) NOT NULL,
    user_id             BIGINT          NOT NULL,
    resource_id         BIGINT          NOT NULL,
    booking_date        DATE            NOT NULL,
    start_time          DATETIME2(0)    NOT NULL,
    end_time            DATETIME2(0)    NOT NULL,
    purpose             NVARCHAR(500)   NOT NULL,
    expected_attendees  INT             NULL,
    status              NVARCHAR(30)    NOT NULL CONSTRAINT DF_Bookings_status DEFAULT ('PENDING'),
    approved_at         DATETIME2(0)    NULL,
    review_reasons      NVARCHAR(500)   NULL,
    created_at          DATETIME2(0)    NOT NULL CONSTRAINT DF_Bookings_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2(0)    NOT NULL CONSTRAINT DF_Bookings_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Bookings           PRIMARY KEY (booking_id),
    CONSTRAINT FK_Bookings_User      FOREIGN KEY (user_id)     REFERENCES dbo.Users      (user_id),
    CONSTRAINT FK_Bookings_Resource  FOREIGN KEY (resource_id) REFERENCES dbo.Resources (resource_id),
    CONSTRAINT CK_Bookings_time      CHECK (end_time > start_time)
);

/* ============================================================
   9) Notification
   - received by a User
   - optionally triggered by a Ticket / Booking
   ============================================================ */
CREATE TABLE dbo.Notification (
    notification_id  BIGINT          IDENTITY(1,1) NOT NULL,
    user_id          BIGINT          NOT NULL,        -- recipient
    type             NVARCHAR(50)    NOT NULL,        -- TICKET, BOOKING, SYSTEM, etc.
    title            NVARCHAR(200)   NOT NULL,
    message          NVARCHAR(MAX)   NOT NULL,
    is_read          BIT             NOT NULL CONSTRAINT DF_Notification_is_read DEFAULT (0),
    read_at          DATETIME2(0)    NULL,
    related_ticket_id   BIGINT       NULL,            -- "triggers" link from Ticket
    related_booking_id  BIGINT       NULL,            -- "triggers" link from Booking
    created_at       DATETIME2(0)    NOT NULL CONSTRAINT DF_Notification_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Notification              PRIMARY KEY (notification_id),
    CONSTRAINT FK_Notification_User         FOREIGN KEY (user_id)            REFERENCES dbo.Users    (user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Notification_Ticket       FOREIGN KEY (related_ticket_id)  REFERENCES dbo.Ticket   (ticket_id),
    CONSTRAINT FK_Notification_Booking      FOREIGN KEY (related_booking_id) REFERENCES dbo.Bookings (booking_id)
);

/* ============================================================
   Indexes for common lookups / FK joins
   ============================================================ */
CREATE INDEX IX_User_Role_user           ON dbo.User_Role        (user_id);
CREATE INDEX IX_User_Role_role           ON dbo.User_Role        (role_id);

CREATE INDEX IX_Ticket_user              ON dbo.Ticket           (user_id);
CREATE INDEX IX_Ticket_resource          ON dbo.Ticket           (resource_id);
CREATE INDEX IX_Ticket_status            ON dbo.Ticket           (status);
CREATE INDEX IX_Ticket_created_at        ON dbo.Ticket           (created_at DESC);

CREATE INDEX IX_Ticket_comment_ticket    ON dbo.Ticket_comment   (ticket_id);
CREATE INDEX IX_Ticket_comment_user      ON dbo.Ticket_comment   (user_id);

CREATE INDEX IX_Ticket_attachment_ticket ON dbo.Ticket_attachment (ticket_id);

CREATE INDEX IX_Bookings_user            ON dbo.Bookings         (user_id);
CREATE INDEX IX_Bookings_resource        ON dbo.Bookings         (resource_id);
CREATE INDEX IX_Bookings_date            ON dbo.Bookings         (booking_date);
CREATE INDEX IX_Bookings_status          ON dbo.Bookings         (status);

CREATE INDEX IX_Notification_user_unread ON dbo.Notification     (user_id, is_read);
CREATE INDEX IX_Notification_created_at  ON dbo.Notification     (created_at DESC);

/* ============================================================
   Seed: default roles
   ============================================================ */
INSERT INTO dbo.Roles (role_name) VALUES
    (N'ADMIN'),
    (N'STAFF'),
    (N'STUDENT'),
    (N'FACULTY');
