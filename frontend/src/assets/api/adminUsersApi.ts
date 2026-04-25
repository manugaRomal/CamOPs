import type { AdminUserSummary } from "../types/adminUser";
import { apiFetch } from "./apiFetch";

async function throwOnError(response: Response): Promise<void> {
  if (!response.ok) {
    const errorBody: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Request failed");
  }
}

export const adminUsersApi = {
  async list(): Promise<AdminUserSummary[]> {
    const response = await apiFetch("/api/users");
    await throwOnError(response);
    return (await response.json()) as AdminUserSummary[];
  },
};
