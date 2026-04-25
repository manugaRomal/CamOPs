import type { CurrentUser } from "../../auth/types";
import { apiFetch } from "./apiFetch";

export type PatchProfileResponse = {
  profile: CurrentUser;
  accessToken: string;
};

export const authApi = {
  async patchProfile(partial: {
    fullName?: string;
    phone?: string;
    department?: string;
  }): Promise<PatchProfileResponse> {
    const response = await apiFetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (!response.ok) {
      const err: { message?: string } = await response.json().catch(() => ({}));
      throw new Error(err.message ?? "Could not update profile");
    }
    return (await response.json()) as PatchProfileResponse;
  },
};
