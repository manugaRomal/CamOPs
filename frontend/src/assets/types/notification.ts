/** Matches {@link com.example.backend.dto.NotificationResponseDTO} JSON. */
export type AppNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  relatedBookingId: number | null;
  relatedTicketId: number | null;
  createdAt: string | null;
};
