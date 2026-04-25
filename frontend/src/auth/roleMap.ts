import type { CurrentUser } from "./types";

const ADMIN = "ADMIN";
const TECHNICIAN = "TECHNICIAN";
const STUDENT = "STUDENT";

/**
 * Home dashboard to render (matches DashboardRouter).
 * Only three product roles: admin, technician, student.
 */
export type HomeDashboard = "ADMIN" | "TECHNICIAN" | "STUDENT";

/**
 * Sidebar / shell (same precedence as home).
 */
export type ShellRole = "ADMIN" | "TECHNICIAN" | "STUDENT";

function normalize(roles: string[] | undefined): string[] {
  if (!roles?.length) {
    return [];
  }
  return roles.map((r) => r.toUpperCase());
}

/** Bookings list (all), resource CRUD, user roles: admin only. */
export function isAdmin(roles: string[] | undefined): boolean {
  return normalize(roles).includes(ADMIN);
}

/**
 * Precedence: ADMIN (full ops) > TECHNICIAN (field work) > STUDENT.
 * If no known role, default to student shell.
 */
export function mapHomeDashboard(roles: string[] | undefined): HomeDashboard {
  const r = normalize(roles);
  if (r.includes(ADMIN)) {
    return "ADMIN";
  }
  if (r.includes(TECHNICIAN)) {
    return "TECHNICIAN";
  }
  if (r.includes(STUDENT)) {
    return "STUDENT";
  }
  return "STUDENT";
}

export function mapShellRole(user: CurrentUser | null): ShellRole {
  if (user == null) {
    return "STUDENT";
  }
  return mapHomeDashboard(user.roles);
}

export function shellRoleLabel(role: ShellRole): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "TECHNICIAN":
      return "Technician";
    case "STUDENT":
    default:
      return "Student";
  }
}
