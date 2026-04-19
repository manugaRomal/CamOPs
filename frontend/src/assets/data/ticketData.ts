import type { Ticket } from "../types/ticket";
import { TicketStatus, TicketPriority, TicketCategory } from "../types/ticket";

export const mockTickets: Ticket[] = [
  {
    id: "1",
    ticketCode: "TKT-001",
    resourceId: "r1",
    resourceName: "Lecture Hall A",
    reportedBy: "user1",
    reportedByName: "Nethmi Silva",
    assignedTo: "tech1",
    assignedToName: "Kamal Perera",
    category: TicketCategory.AC_ISSUE,
    description: "AC unit in Lecture Hall A is not cooling properly.",
    priority: TicketPriority.MEDIUM,
    preferredContact: "nethmi@sliit.lk",
    status: TicketStatus.IN_PROGRESS,
    attachments: [],
    comments: [
      {
        id: "c1",
        ticketId: "1",
        userId: "tech1",
        userName: "Kamal Perera",
        commentText: "Checked the unit, needs a part replacement.",
        isEdited: false,
        createdAt: "2026-04-10T09:00:00Z",
        updatedAt: "2026-04-10T09:00:00Z",
      },
    ],
    createdAt: "2026-04-08T08:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "2",
    ticketCode: "TKT-002",
    resourceId: "r2",
    resourceName: "Room A3",
    reportedBy: "user1",
    reportedByName: "Nethmi Silva",
    category: TicketCategory.OTHER,
    description: "Speaker system in Room A3 has no audio output.",
    priority: TicketPriority.LOW,
    preferredContact: "nethmi@sliit.lk",
    status: TicketStatus.OPEN,
    attachments: [],
    comments: [],
    createdAt: "2026-04-09T10:00:00Z",
    updatedAt: "2026-04-09T10:00:00Z",
  },
];

export const categoryOptions = [
  { value: TicketCategory.ELECTRICAL, label: "Electrical" },
  { value: TicketCategory.NETWORK, label: "Network" },
  { value: TicketCategory.PROJECTOR_FAULT, label: "Projector Fault" },
  { value: TicketCategory.FURNITURE_DAMAGE, label: "Furniture Damage" },
  { value: TicketCategory.AC_ISSUE, label: "AC Issue" },
  { value: TicketCategory.OTHER, label: "Other" },
];

export const priorityOptions = [
  { value: TicketPriority.LOW, label: "Low" },
  { value: TicketPriority.MEDIUM, label: "Medium" },
  { value: TicketPriority.HIGH, label: "High" },
  { value: TicketPriority.CRITICAL, label: "Critical" },
];

export const mockResources = [
  { id: "r1", name: "Lecture Hall A" },
  { id: "r2", name: "Room A3" },
  { id: "r3", name: "Lab B202" },
  { id: "r4", name: "Meeting Room 01" },
  { id: "r5", name: "Projector P04" },
];