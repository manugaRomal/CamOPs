export type BookingStatus = "PENDING" | "APPROVED" | "CANCELLED" | "REJECTED" | string;

/** Returned on 409 from POST /api/bookings when the slot conflicts (see backend BookingConflictSuggestionDTO). */
export type AlternativeResourceSuggestion = {
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  capacity?: number | null;
  location?: string | null;
};

export type BookingConflictSuggestion = {
  suggestedStartTime: string;
  suggestedEndTime: string;
  alternativeResources?: AlternativeResourceSuggestion[] | null;
};

export type Booking = {
  bookingId: number;
  userId: number;
  resourceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees?: number | null;
  status: BookingStatus;
  approvedAt?: string | null;
  reviewedBy?: number | null;
  reviewReasons?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};
