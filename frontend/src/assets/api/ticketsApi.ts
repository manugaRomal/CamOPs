import type { SupportTicket, TechnicianOption } from "../types/ticket";
import { apiFetch } from "./apiFetch";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export const ticketsApi = {
  async list(): Promise<SupportTicket[]> {
    const res = await apiFetch("/api/tickets");
    return parseJson<SupportTicket[]>(res);
  },

  async get(id: number): Promise<SupportTicket> {
    const res = await apiFetch(`/api/tickets/${id}`);
    return parseJson<SupportTicket>(res);
  },

  async create(body: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    resourceId?: number;
    preferredContact?: string;
  }): Promise<SupportTicket> {
    const res = await apiFetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<SupportTicket>(res);
  },

  async assign(ticketId: number, assignedToUserId: number): Promise<SupportTicket> {
    const res = await apiFetch(`/api/tickets/${ticketId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToUserId }),
    });
    return parseJson<SupportTicket>(res);
  },

  async addComment(ticketId: number, text: string): Promise<SupportTicket> {
    const res = await apiFetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return parseJson<SupportTicket>(res);
  },

  async resolve(ticketId: number, resolutionNotes: string): Promise<SupportTicket> {
    const res = await apiFetch(`/api/tickets/${ticketId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutionNotes }),
    });
    return parseJson<SupportTicket>(res);
  },

  async listTechnicians(): Promise<TechnicianOption[]> {
    const res = await apiFetch("/api/tickets/technicians");
    return parseJson<TechnicianOption[]>(res);
  },

  async update(
    ticketId: number,
    body: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
      resourceId?: number;
      preferredContact?: string;
    },
  ): Promise<SupportTicket> {
    const res = await apiFetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<SupportTicket>(res);
  },

  async delete(ticketId: number): Promise<void> {
    const res = await apiFetch(`/api/tickets/${ticketId}`, { method: "DELETE" });
    if (!res.ok) {
      const body: { message?: string } = await res.json().catch(() => ({}));
      throw new Error(body.message ?? "Request failed");
    }
  },
};
