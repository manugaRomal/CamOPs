export type ResourceStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";

export type Resource = {
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  resourceType: string;
  description?: string;
  status: ResourceStatus;
  location?: string;
  capacity: number;
  resourceImage?: string;
  availabilityStartTime: string;
  availabilityEndTime: string;
};

export type ResourcePayload = Omit<Resource, "resourceId">;

export type ResourceFilter = {
  resourceType?: string;
  location?: string;
  capacity?: number;
  status?: string;
};
