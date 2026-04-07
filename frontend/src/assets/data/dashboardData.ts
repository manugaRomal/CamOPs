//dashboardData.ts

export type Stat = {
  title: string;
  value: number;
  subtitle: string;
};

export type BookingItem = {
  resource: string;
  time: string;
  status: string;
};

export type TicketItem = {
  title: string;
  priority: string;
  status: string;
};

export type MyBookingItem = {
  resource: string;
  date: string;
  time: string;
  status: string;
};

export const adminStats: Stat[] = [
  { title: "Total Resources", value: 128, subtitle: "Across campus" },
  { title: "Bookings Today", value: 54, subtitle: "8 pending approval" },
  { title: "Open Tickets", value: 19, subtitle: "4 high priority" },
  { title: "Unread Notifications", value: 12, subtitle: "New updates available" },
];

export const userStats: Stat[] = [
  { title: "My Bookings", value: 6, subtitle: "2 upcoming today" },
  { title: "My Tickets", value: 3, subtitle: "1 in progress" },
  { title: "Notifications", value: 5, subtitle: "2 unread" },
  { title: "Available Resources", value: 42, subtitle: "Ready to book now" },
];

export const technicianStats: Stat[] = [
  { title: "Assigned Tickets", value: 11, subtitle: "3 urgent" },
  { title: "In Progress", value: 6, subtitle: "Currently working" },
  { title: "Resolved Today", value: 4, subtitle: "Good progress" },
  { title: "Pending Updates", value: 2, subtitle: "Need status update" },
];

export const recentActivities: string[] = [
  "Booking approved for Lab B202",
  "Ticket #102 assigned to technician",
  "New comment added to Ticket #205",
  "Projector resource marked out of service",
];

export const pendingBookings: BookingItem[] = [
  { resource: "Room A101", time: "9:00 AM - 11:00 AM", status: "PENDING" },
  { resource: "Lab B202", time: "1:00 PM - 3:00 PM", status: "PENDING" },
  { resource: "Meeting Room C1", time: "2:00 PM - 4:00 PM", status: "APPROVED" },
];

export const highPriorityTickets: TicketItem[] = [
  { title: "Projector not working", priority: "HIGH", status: "OPEN" },
  { title: "Network issue in Lab 3", priority: "CRITICAL", status: "IN_PROGRESS" },
  { title: "Broken chair in Hall 2", priority: "LOW", status: "OPEN" },
];

export const myBookings: MyBookingItem[] = [
  { resource: "Lab B202", date: "2026-04-08", time: "10:00 AM - 12:00 PM", status: "APPROVED" },
  { resource: "Projector P04", date: "2026-04-09", time: "1:00 PM - 2:00 PM", status: "PENDING" },
];

export const myTickets: TicketItem[] = [
  { title: "AC issue in Lecture Hall", priority: "MEDIUM", status: "IN_PROGRESS" },
  { title: "Speaker issue in Room A3", priority: "LOW", status: "OPEN" },
];

export const technicianTickets: TicketItem[] = [
  { title: "Projector issue - Lab 1", priority: "HIGH", status: "IN_PROGRESS" },
  { title: "PC not booting - Lab 2", priority: "MEDIUM", status: "OPEN" },
  { title: "Network fault - Admin Office", priority: "CRITICAL", status: "OPEN" },
];