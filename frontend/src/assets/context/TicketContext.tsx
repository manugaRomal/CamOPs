import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { mockTickets } from "../data/ticketData";
import type { Ticket, TicketComment } from "../types/ticket";
import { TicketStatus } from "../types/ticket";

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (id: string, status: TicketStatus, resolutionNotes?: string) => void;
  assignTicket: (id: string, technicianId: string, technicianName: string) => void;
  rejectTicket: (id: string, rejectionReason: string) => void;
  addComment: (ticketId: string, comment: TicketComment) => void;
  deleteComment: (ticketId: string, commentId: string) => void;
  editComment: (ticketId: string, commentId: string, newText: string) => void;
}

const TicketContext = createContext<TicketContextType | null>(null);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  const addTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const updateTicketStatus = (id: string, status: TicketStatus, resolutionNotes?: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              resolutionNotes: resolutionNotes ?? t.resolutionNotes,
              resolvedAt: status === TicketStatus.RESOLVED ? new Date().toISOString() : t.resolvedAt,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const assignTicket = (id: string, technicianId: string, technicianName: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, assignedTo: technicianId, assignedToName: technicianName, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const rejectTicket = (id: string, rejectionReason: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: TicketStatus.REJECTED,
              rejectionReason,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const addComment = (ticketId: string, comment: TicketComment) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, comments: [...t.comments, comment] }
          : t
      )
    );
  };

  const deleteComment = (ticketId: string, commentId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
          : t
      )
    );
  };

  const editComment = (ticketId: string, commentId: string, newText: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              comments: t.comments.map((c) =>
                c.id === commentId
                  ? { ...c, commentText: newText, isEdited: true, updatedAt: new Date().toISOString() }
                  : c
              ),
            }
          : t
      )
    );
  };

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicketStatus, assignTicket, rejectTicket, addComment, deleteComment, editComment }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTickets must be used within TicketProvider");
  return context;
};