-- =============================================================================
-- CamOPs — manual data seed / bootstrap (MySQL 8+)
-- =============================================================================
-- Use this AFTER your schema and application tables already exist. This file
-- does NOT run automatically; you execute it with the MySQL client (or GUI).
--
-- ------------ BEFORE YOU RUN: change these in your environment ---------------
--
-- 1) Connect to the correct database (same as spring.datasource.url in
--    application.properties), e.g.:
--        mysql -u your_user -p your_database
--    then: SOURCE path/to/seed-manual.sql;
--    or paste sections below into your SQL tool.
--
-- 2) Replace the placeholder values in the "User-configurable" block:
--    - @your_admin_email  → the Google account email you will sign in with
--    (Optional) @your_name → display name for a pre-provisioned row
--
-- 3) google_sub: You do NOT need to pre-fill this if you will sign in with
--    Google first. OAuth matches by email and sets `google_sub` on first
--    successful login. If you insert a user row manually, leave google_sub
--    NULL, or set it to your real "sub" from Google if you know it.
--
-- 4) role_id / user_id: This script uses role_name lookups (not hard-coded
--    integer IDs) so it stays valid even if the Roles table was seeded
--    in a different order.
--
-- 5) If you use Hibernate ddl-auto: avoid running destructive schema.sql
--    against a DB that already has JPA-migrated data — prefer incremental
--    INSERTs on that database only.
--
-- ------------ Typical flows --------------------------------------------------
--
-- A) You already signed in once (user row exists) → use SECTION 2 only
--    to grant yourself ADMIN.
--
-- B) Fresh DB, you want an admin before any login → use SECTION 3 (user +
--    ADMIN in one go). First Google login will attach your google_sub
--    to the existing row (matched by email).
-- =============================================================================
-- Pre-configured: manugaromal@gmail.com → ADMIN (see SECTIONS 1–3).
-- Do NOT run SECTION 5 for this same email: it removes all roles and sets STUDENT only.
-- =============================================================================


-- --- User-configurable: edit if you use a different account ---

-- Google "Continue with Google" sign-in address for this admin user
SET @your_admin_email = 'manugaromal@gmail.com';
SET @your_name        = 'Manu';

-- (Optional) Which role to link (must exist in `Roles`, see SECTION 1)
-- Allowed product roles: ADMIN, TECHNICIAN, STUDENT
-- Most common: grant yourself ADMIN
SET @grant_role = 'ADMIN';


-- =============================================================================
-- SECTION 1 — Ensure base roles exist (idempotent, matches app expectations)
-- =============================================================================
-- Backend seeds: ADMIN, TECHNICIAN, STUDENT (see RoleDataInitializer)

INSERT IGNORE INTO Roles (role_name) VALUES
    ('ADMIN'),
    ('TECHNICIAN'),
    ('STUDENT');


-- =============================================================================
-- SECTION 2 — Grant a role to an EXISTING user (by email)
-- =============================================================================
-- Use after the user has already been created (e.g. by first Google sign-in).

INSERT INTO User_Role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM Users u
JOIN Roles r ON r.role_name = @grant_role
WHERE u.email = @your_admin_email
  AND NOT EXISTS (
      SELECT 1
      FROM User_Role ur
      WHERE ur.user_id = u.user_id
        AND ur.role_id = r.role_id
  );


-- =============================================================================
-- SECTION 3 (optional) — Create a user row + ADMIN, if they do not exist yet
-- =============================================================================
-- If no Users row: creates one. If user exists, only adds the role link.
-- `google_sub` is left NULL; first OAuth login will set it.

INSERT INTO Users (full_name, email, is_active, google_sub)
SELECT @your_name, @your_admin_email, TRUE, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.email = @your_admin_email);

INSERT INTO User_Role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM Users u
JOIN Roles r ON r.role_name = 'ADMIN'
WHERE u.email = @your_admin_email
  AND NOT EXISTS (
      SELECT 1
      FROM User_Role ur
      WHERE ur.user_id = u.user_id
        AND ur.role_id = r.role_id
  );


-- =============================================================================
-- SECTION 4 (optional) — One sample room/resource for local booking tests
-- =============================================================================
-- Only inserts if a resource with this code does not already exist.

INSERT INTO Resources
    (resource_code, resource_name, resource_type, status, location, capacity)
SELECT
    'LAB-101',
    'Seminar room 101',
    'Room',
    'ACTIVE',
    'North campus',
    20
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM Resources r WHERE r.resource_code = 'LAB-101');


-- =============================================================================
-- SECTION 5 — (Optional) Another account as STUDENT only
-- =============================================================================
-- First-time "Continue with Google" already gives STUDENT (app default) if the
-- user has no rows in User_Role. Use this for a *different* test account, or
-- to reset someone to student. Running this for manugaromal@gmail.com will
-- **remove** your ADMIN role — use a separate @student_email.
--
-- 1) Set @student_email (not your admin email if you need admin access).
-- 2) Run SECTION 1 first (so the STUDENT role exists in Roles).
-- 3) Run this block.

SET @student_email = 'student-example@example.com';
SET @student_name  = 'Test Student';

-- Create user if missing (first login would create them anyway, with STUDENT)
INSERT INTO Users (full_name, email, is_active, google_sub)
SELECT @student_name, @student_email, TRUE, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM Users u WHERE u.email = @student_email);

-- Remove every role for this user, then attach STUDENT only
DELETE ur
FROM User_Role ur
INNER JOIN Users u ON u.user_id = ur.user_id
WHERE u.email = @student_email;

INSERT INTO User_Role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM Users u
INNER JOIN Roles r ON r.role_name = 'STUDENT'
WHERE u.email = @student_email;


-- =============================================================================
-- Verify (optional) — run these to inspect your user and roles
-- =============================================================================
-- SELECT user_id, email, full_name, google_sub, is_active FROM Users WHERE email = @your_admin_email;
-- SELECT r.role_name
-- FROM User_Role ur
-- JOIN Users u ON u.user_id = ur.user_id
-- JOIN Roles r ON r.role_id = ur.role_id
-- WHERE u.email = @your_admin_email;
--
-- For SECTION 5:
-- SELECT user_id, email FROM Users WHERE email = @student_email;
-- SELECT r.role_name FROM User_Role ur JOIN Users u ON u.user_id=ur.user_id
--   JOIN Roles r ON r.role_id=ur.role_id WHERE u.email = @student_email;
