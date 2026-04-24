import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Ticket, TicketComment } from "../types/ticket";
import { TicketStatus } from "../types/ticket";
import * as ticketService from "../services/ticketService";

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refreshTickets: () => void;
  addTicket: (ticket: Omit<Ticket, "id" | "ticketCode" | "status" | "createdAt" | "updatedAt" | "attachments" | "comments">) => Promise<void>;
  updateTicketStatus: (id: string, status: TicketStatus, resolutionNotes?: string) => Promise<void>;
  assignTicket: (id: string, technicianId: string, technicianName: string) => Promise<void>;
  rejectTicket: (id: string, rejectionReason: string) => Promise<void>;
  addComment: (ticketId: string, comment: TicketComment) => Promise<void>;
  deleteComment: (ticketId: string, commentId: string) => Promise<void>;
  editComment: (ticketId: string, commentId: string, newText: string) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | null>(null);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets();
      const ticketsWithAttachments = await Promise.all(
        data.map(async (t: any) => {
          const attachments = await ticketService.getAttachmentsByTicket(t.ticketId);
          return {
            id: String(t.ticketId),
            ticketCode: t.ticketCode,
            resourceId: t.resourceId ? String(t.resourceId) : undefined,
            resourceName: t.resourceName,
            reportedBy: String(t.userId),
            reportedByName: "User " + t.userId,
            assignedTo: t.assignedTo ? String(t.assignedTo) : undefined,
            assignedToName: t.assignedToName,
            category: t.category,
            description: t.description,
            priority: t.priority,
            preferredContact: t.preferredContact,
            status: t.status,
            resolutionNotes: t.resolutionNotes,
            rejectionReason: t.rejectionReason,
            attachments: attachments.map((att: any) => ({
              id: String(att.attachmentId),
              fileName: att.fileName,
              fileUrl: `http://localhost:8080/${att.filePath}`,
              fileType: att.fileType,
              uploadedAt: att.uploadedAt ?? new Date().toISOString(),
            })),
            comments: [],
            createdAt: t.createdAt ?? new Date().toISOString(),
            updatedAt: t.updatedAt ?? new Date().toISOString(),
            resolvedAt: t.resolvedAt,
          };
        })
      );
      setTickets(ticketsWithAttachments);
      setError(null);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = async (ticket: any) => {
    try {
      await ticketService.createTicket({
        userId: 1,
        resourceId: ticket.resourceId,
        category: ticket.category,
        priority: ticket.priority,
        description: ticket.description,
        preferredContact: ticket.preferredContact,
      });
      await fetchTickets();
    } catch (err) {
      setError("Failed to create ticket");
    }
  };

  const updateTicketStatus = async (id: string, status: TicketStatus, resolutionNotes?: string) => {
    try {
      if (status === TicketStatus.RESOLVED && resolutionNotes) {
        await ticketService.resolveTicket(Number(id), resolutionNotes);
      } else if (status === TicketStatus.CLOSED) {
        await ticketService.closeTicket(Number(id));
      } else {
        await ticketService.updateTicketStatus(Number(id), status);
      }
      await fetchTickets();
    } catch (err) {
      setError("Failed to update ticket status");
    }
  };

  const assignTicket = async (id: string, _technicianId: string, _technicianName: string) => {
    try {
      await ticketService.updateTicketStatus(Number(id), "IN_PROGRESS");
      await fetchTickets();
    } catch (err) {
      setError("Failed to assign ticket");
    }
  };

  const rejectTicket = async (id: string, rejectionReason: string) => {
    try {
      await ticketService.rejectTicket(Number(id), rejectionReason);
      await fetchTickets();
    } catch (err) {
      setError("Failed to reject ticket");
    }
  };

  const addComment = async (ticketId: string, comment: TicketComment) => {
    try {
      await ticketService.addComment(Number(ticketId), {
        userId: 1,
        commentText: comment.commentText,
      });
      await fetchTickets();
    } catch (err) {
      setError("Failed to add comment");
    }
  };

  const deleteComment = async (_ticketId: string, commentId: string) => {
    try {
      await ticketService.deleteComment(Number(commentId), 1);
      await fetchTickets();
    } catch (err) {
      setError("Failed to delete comment");
    }
  };

  const editComment = async (_ticketId: string, commentId: string, newText: string) => {
    try {
      await ticketService.editComment(Number(commentId), newText, 1);
      await fetchTickets();
    } catch (err) {
      setError("Failed to edit comment");
    }
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      loading,
      error,
      refreshTickets: fetchTickets,
      addTicket,
      updateTicketStatus,
      assignTicket,
      rejectTicket,
      addComment,
      deleteComment,
      editComment,
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTickets must be used within TicketProvider");
  return context;
};