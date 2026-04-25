import type { CurrentUser } from "./types";

/**
 * Resolves a single UI role for the sidebar and dashboard (first match wins by priority).
 */
export function mapDashboardRole(roles: string[] | undefined): "ADMIN" | "TECHNICIAN" | "STUDENT" | "USER" {
  if (!roles?.length) {
    return "USER";
  }
  if (roles.includes("ADMIN")) {
    return "ADMIN";
  }
  if (roles.includes("STAFF") || roles.includes("TECHNICIAN")) {
    return "TECHNICIAN";
  }
  if (roles.includes("STUDENT")) {
    return "STUDENT";
  }
  return "USER";
}

export function displayUserLabel(user: CurrentUser | null): string {
  if (!user) {
    return "";
  }
  return user.fullName?.trim() || user.email;
}

/** True if the user may create/edit/delete resources (matches backend @PreAuthorize("hasRole('ADMIN')")). */
export function isAdmin(roles: string[] | undefined): boolean {
  return roles?.includes("ADMIN") ?? false;
}

/** Technicians and staff see assigned work (matches backend ROLE_TECHNICIAN and similar). */
export function isTechnician(roles: string[] | undefined): boolean {
  if (!roles?.length) {
    return false;
  }
  return roles.includes("TECHNICIAN") || roles.includes("STAFF");
}

export function shellRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "TECHNICIAN":
      return "Technician";
    case "STUDENT":
      return "Student";
    default:
      return "User";
  }
}
