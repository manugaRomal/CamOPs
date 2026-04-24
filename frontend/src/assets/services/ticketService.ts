const BASE_URL = "http://localhost:8080/api";

// Get all tickets
export const getAllTickets = async () => {
  const response = await fetch(`${BASE_URL}/tickets`);
  if (!response.ok) throw new Error("Failed to fetch tickets");
  return response.json();
};

// Get ticket by id
export const getTicketById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/tickets/${id}`);
  if (!response.ok) throw new Error("Failed to fetch ticket");
  return response.json();
};

// Get tickets by user
export const getTicketsByUser = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/tickets/user/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user tickets");
  return response.json();
};

// Get tickets by assigned technician
export const getTicketsByAssignedTo = async (technicianId: number) => {
  const response = await fetch(`${BASE_URL}/tickets/assigned/${technicianId}`);
  if (!response.ok) throw new Error("Failed to fetch assigned tickets");
  return response.json();
};

// Create ticket
export const createTicket = async (ticket: {
  userId: number;
  resourceId?: string | undefined;
  category: string;
  priority: string;
  description: string;
  preferredContact: string;
}) => {
  const payload = {
    userId: ticket.userId,
    category: ticket.category,
    priority: ticket.priority,
    description: ticket.description,
    preferredContact: ticket.preferredContact,
  };

  const response = await fetch(`${BASE_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create ticket");
  return response.json();
};

// Update ticket status
export const updateTicketStatus = async (id: number, status: string) => {
  const response = await fetch(`${BASE_URL}/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update ticket status");
  return response.json();
};

// Assign ticket to technician (Admin)
export const assignTicket = async (ticketId: number, technicianId: number) => {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ technicianId }),
  });
  if (!response.ok) throw new Error("Failed to assign ticket");
  return response.json();
};

// Resolve ticket
export const resolveTicket = async (id: number, resolutionNotes: string) => {
  const response = await fetch(`${BASE_URL}/tickets/${id}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolutionNotes }),
  });
  if (!response.ok) throw new Error("Failed to resolve ticket");
  return response.json();
};

// Reject ticket
export const rejectTicket = async (id: number, rejectionReason: string) => {
  const response = await fetch(`${BASE_URL}/tickets/${id}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rejectionReason }),
  });
  if (!response.ok) throw new Error("Failed to reject ticket");
  return response.json();
};

// Close ticket
export const closeTicket = async (id: number) => {
  const response = await fetch(`${BASE_URL}/tickets/${id}/close`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to close ticket");
  return response.json();
};

// Get comments by ticket
export const getCommentsByTicket = async (ticketId: number) => {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/comments`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
};

// Add comment
export const addComment = async (ticketId: number, comment: {
  userId: number;
  commentText: string;
}) => {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
};

// Edit comment
export const editComment = async (commentId: number, commentText: string, userId: number) => {
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentText, userId: String(userId) }),
  });
  if (!response.ok) throw new Error("Failed to edit comment");
  return response.json();
};

// Delete comment
export const deleteComment = async (commentId: number, userId: number) => {
  const response = await fetch(`${BASE_URL}/comments/${commentId}?userId=${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete comment");
};

// Upload attachment
export const uploadAttachment = async (ticketId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/attachments`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload attachment");
  return response.json();
};

// Get attachments by ticket
export const getAttachmentsByTicket = async (ticketId: number) => {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/attachments`);
  if (!response.ok) throw new Error("Failed to fetch attachments");
  return response.json();
};