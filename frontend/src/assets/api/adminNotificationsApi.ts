import type { AdminNotificationRow, BroadcastResult, PagedResponse } from "../types/adminNotification";
import { apiFetch } from "./apiFetch";

async function throwOnError(response: Response): Promise<void> {
  if (!response.ok) {
    const errorBody: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Request failed");
  }
}

function pageParams(page: number, size: number): string {
  return new URLSearchParams({ page: String(page), size: String(size) }).toString();
}

export const adminNotificationsApi = {
  async list(page = 0, size = 20): Promise<PagedResponse<AdminNotificationRow>> {
    const response = await apiFetch(`/api/admin/notifications?${pageParams(page, size)}`);
    await throwOnError(response);
    return (await response.json()) as PagedResponse<AdminNotificationRow>;
  },

  async get(id: number): Promise<AdminNotificationRow> {
    const response = await apiFetch(`/api/admin/notifications/${id}`);
    await throwOnError(response);
    return (await response.json()) as AdminNotificationRow;
  },

  async broadcast(body: {
    title: string;
    message: string;
    type?: string;
    /** If set, only these user ids; if omitted, send to everyone. */
    recipientUserIds?: number[];
  }): Promise<BroadcastResult> {
    const response = await apiFetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await throwOnError(response);
    return (await response.json()) as BroadcastResult;
  },

  async updateOne(
    id: number,
    patch: { title?: string; message?: string; type?: string },
  ): Promise<void> {
    const response = await apiFetch(`/api/admin/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await throwOnError(response);
  },

  async updateBatch(
    batchId: string,
    patch: { title?: string; message?: string; type?: string },
  ): Promise<{ updated: number }> {
    const response = await apiFetch(`/api/admin/notifications/batch/${encodeURIComponent(batchId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await throwOnError(response);
    return (await response.json()) as { updated: number };
  },

  async deleteOne(id: number): Promise<void> {
    const response = await apiFetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
    await throwOnError(response);
  },

  async deleteBatch(batchId: string): Promise<{ deleted: number }> {
    const response = await apiFetch(
      `/api/admin/notifications/batch/${encodeURIComponent(batchId)}`,
      { method: "DELETE" },
    );
    await throwOnError(response);
    return (await response.json()) as { deleted: number };
  },
};
