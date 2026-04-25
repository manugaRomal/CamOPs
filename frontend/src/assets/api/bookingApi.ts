import type { Booking } from "../types/booking";

const API_BASE_URL = "/api/bookings";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export const bookingApi = {
  async list(userId?: number): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (typeof userId === "number" && Number.isFinite(userId)) {
      params.set("userId", String(userId));
    }

    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}${query ? `?${query}` : ""}`);
    return parseResponse<Booking[]>(response);
  },

  async getById(id: number): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return parseResponse<Booking>(response);
  },

  async approve(id: number, reviewedBy?: number, reviewReason?: string): Promise<Booking> {
    const params = new URLSearchParams();
    if (typeof reviewedBy === "number" && Number.isFinite(reviewedBy)) {
      params.set("reviewedBy", String(reviewedBy));
    }
    if (reviewReason && reviewReason.trim().length > 0) {
      params.set("reviewReason", reviewReason.trim());
    }

    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/${id}/approve${query ? `?${query}` : ""}`, {
      method: "PATCH",
    });
    return parseResponse<Booking>(response);
  },

  async reject(id: number, reviewedBy?: number, reviewReason?: string): Promise<Booking> {
    const params = new URLSearchParams();
    if (typeof reviewedBy === "number" && Number.isFinite(reviewedBy)) {
      params.set("reviewedBy", String(reviewedBy));
    }
    if (reviewReason && reviewReason.trim().length > 0) {
      params.set("reviewReason", reviewReason.trim());
    }

    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/${id}/reject${query ? `?${query}` : ""}`, {
      method: "PATCH",
    });
    return parseResponse<Booking>(response);
  },

  async create(payload: {
    userId: number;
    resourceId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
    expectedAttendees?: number;
  }): Promise<Booking> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseResponse<Booking>(response);
  },

  async cancel(id: number, studentUserId: number, cancelReason?: string): Promise<Booking> {
    const params = new URLSearchParams();
    params.set("studentUserId", String(studentUserId));
    if (cancelReason && cancelReason.trim().length > 0) {
      params.set("cancelReason", cancelReason.trim());
    }

    const response = await fetch(`${API_BASE_URL}/${id}/cancel?${params.toString()}`, {
      method: "PATCH",
    });
    return parseResponse<Booking>(response);
  },
};
