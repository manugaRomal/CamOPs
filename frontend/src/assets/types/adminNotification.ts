/** Matches admin notification list item from the backend. */
export type AdminNotificationRow = {
  id: number;
  userId: number;
  userEmail: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string | null;
  batchId: string | null;
};

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type BroadcastResult = {
  batchId: string | null;
  recipientCount: number;
};
