import type { Booking, BookingConflictSuggestion } from "../types/booking";
import { apiFetch } from "./apiFetch";

const API_BASE_URL = "/api/bookings";

export class BookingConflictError extends Error {
  readonly suggestion: BookingConflictSuggestion;

  constructor(message: string, suggestion: BookingConflictSuggestion) {
    super(message);
    this.name = "BookingConflictError";
    this.suggestion = suggestion;
  }
}

export function isBookingConflictError(value: unknown): value is BookingConflictError {
  return value instanceof BookingConflictError;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody: { message?: string } = await response.json().catch(() => ({}));
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
    const response = await apiFetch(`${API_BASE_URL}${query ? `?${query}` : ""}`);
    return parseResponse<Booking[]>(response);
  },

  async getById(id: number): Promise<Booking> {
    const response = await apiFetch(`${API_BASE_URL}/${id}`);
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
    const response = await apiFetch(`${API_BASE_URL}/${id}/approve${query ? `?${query}` : ""}`, {
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
    const response = await apiFetch(`${API_BASE_URL}/${id}/reject${query ? `?${query}` : ""}`, {
      method: "PATCH",
    });
    return parseResponse<Booking>(response);
  },

  async create(payload: {
    userId?: number;
    resourceId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
    expectedAttendees?: number;
  }): Promise<Booking> {
    const { userId: _u, ...body } = payload;
    const response = await apiFetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 409) {
      const errorBody = (await response.json().catch(() => ({}))) as {
        message?: string;
        suggestion?: BookingConflictSuggestion;
      };
      throw new BookingConflictError(
        errorBody.message ?? "The selected time slot is not available.",
        errorBody.suggestion ?? {
          suggestedStartTime: "",
          suggestedEndTime: "",
          alternativeResources: [],
        }
      );
    }
    return parseResponse<Booking>(response);
  },

  async cancel(id: number, cancelReason?: string): Promise<Booking> {
    const params = new URLSearchParams();
    if (cancelReason && cancelReason.trim().length > 0) {
      params.set("cancelReason", cancelReason.trim());
    }
    const q = params.toString();
    const response = await apiFetch(`${API_BASE_URL}/${id}/cancel${q ? `?${q}` : ""}`, {
      method: "PATCH",
    });
    return parseResponse<Booking>(response);
  },
};
