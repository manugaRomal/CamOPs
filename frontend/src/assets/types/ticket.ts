export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
} as const;
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const TicketCategory = {
  ELECTRICAL: "ELECTRICAL",
  NETWORK: "NETWORK",
  PROJECTOR_FAULT: "PROJECTOR_FAULT",
  FURNITURE_DAMAGE: "FURNITURE_DAMAGE",
  AC_ISSUE: "AC_ISSUE",
  OTHER: "OTHER",
} as const;
export type TicketCategory = typeof TicketCategory[keyof typeof TicketCategory];

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  commentText: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  resourceId?: string;
  resourceName?: string;
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  preferredContact: string;
  status: TicketStatus;
  resolutionNotes?: string;
  rejectionReason?: string;
  attachments: TicketAttachment[];
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateTicketRequest {
  resourceId?: string;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  preferredContact: string;
}