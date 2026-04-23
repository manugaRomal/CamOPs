import type { Resource, ResourceFilter, ResourcePayload, ResourceStatus } from "../types/resource";
import type { ResourceHealth } from "../types/resourceHealth";

const API_BASE_URL = "http://localhost:8080/api/resources";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

function buildQueryParams(filters?: ResourceFilter): string {
  if (!filters) {
    return "";
  }

  const params = new URLSearchParams();
  if (filters.resourceType) params.set("resourceType", filters.resourceType);
  if (filters.location) params.set("location", filters.location);
  if (typeof filters.capacity === "number") params.set("capacity", String(filters.capacity));
  if (filters.status) params.set("status", filters.status);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export const resourceApi = {
  async list(filters?: ResourceFilter): Promise<Resource[]> {
    const response = await fetch(`${API_BASE_URL}${buildQueryParams(filters)}`);
    return parseResponse<Resource[]>(response);
  },

  async getById(id: number): Promise<Resource> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return parseResponse<Resource>(response);
  },

  async getHealth(id: number): Promise<ResourceHealth> {
    const response = await fetch(`${API_BASE_URL}/${id}/health`);
    const data = await parseResponse<{
      score: number;
      label: string;
      resourceStatus: string;
      openTicketCount: number;
      urgentOpenTicketCount: number;
      totalTicketCount: number;
      factors: string[];
    }>(response);
    return {
      score: data.score,
      label: data.label,
      resourceStatus: data.resourceStatus,
      openTicketCount: Number(data.openTicketCount),
      urgentOpenTicketCount: Number(data.urgentOpenTicketCount),
      totalTicketCount: Number(data.totalTicketCount),
      factors: data.factors ?? [],
    };
  },

  async create(payload: ResourcePayload): Promise<Resource> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseResponse<Resource>(response);
  },

  async update(id: number, payload: ResourcePayload): Promise<Resource> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseResponse<Resource>(response);
  },

  async remove(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message ?? "Failed to delete resource");
    }
  },

  async updateStatus(id: number, status: ResourceStatus): Promise<Resource> {
    const response = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return parseResponse<Resource>(response);
  },
};
