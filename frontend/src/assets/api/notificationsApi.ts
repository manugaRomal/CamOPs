import type { AppNotification } from "../types/notification";
import { apiFetch } from "./apiFetch";

async function throwOnError(response: Response): Promise<void> {
  if (!response.ok) {
    const errorBody: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Request failed");
  }
}

export const notificationsApi = {
  async list(): Promise<AppNotification[]> {
    const response = await apiFetch("/api/notifications");
    await throwOnError(response);
    return (await response.json()) as AppNotification[];
  },

  async unreadCount(): Promise<number> {
    const response = await apiFetch("/api/notifications/unread-count");
    await throwOnError(response);
    const data = (await response.json()) as { count?: number };
    return Number(data.count ?? 0);
  },

  async markRead(id: number): Promise<void> {
    const response = await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    await throwOnError(response);
  },

  async markAllRead(): Promise<number> {
    const response = await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    await throwOnError(response);
    const data = (await response.json()) as { updated?: number };
    return Number(data.updated ?? 0);
  },
};
