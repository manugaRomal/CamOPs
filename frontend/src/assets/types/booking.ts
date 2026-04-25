export type BookingStatus = "PENDING" | "APPROVED" | "CANCELLED" | "REJECTED" | string;

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
