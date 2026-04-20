import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { mockTickets } from "../data/ticketData";
import type { Ticket } from "../types/ticket";
import { TicketStatus } from "../types/ticket";

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (id: string, status: TicketStatus, resolutionNotes?: string) => void;
  assignTicket: (id: string, technicianId: string, technicianName: string) => void;
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

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicketStatus, assignTicket }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTickets must be used within TicketProvider");
  return context;
};