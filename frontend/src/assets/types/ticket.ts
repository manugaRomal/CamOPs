export type TicketComment = {
  commentId: number;
  userId: number;
  authorName?: string;
  commentText: string;
  createdAt: string | null;
};

export type SupportTicket = {
  ticketId: number;
  ticketCode: string;
  userId: number;
  requesterName?: string;
  requesterEmail?: string;
  resourceId: number | null;
  resourceName?: string | null;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  preferredContact?: string | null;
  assignedToUserId: number | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  comments?: TicketComment[] | null;
};

export type TechnicianOption = {
  id: number;
  fullName: string;
  email: string;
};
