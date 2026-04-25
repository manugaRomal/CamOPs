export type AppNotification = {
  notificationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean | null;
  readAt: string | null;
  relatedTicketId: number | null;
  relatedBookingId: number | null;
  createdAt: string | null;
};
