export type ResourceHealth = {
  score: number;
  label: string;
  resourceStatus: string;
  openTicketCount: number;
  urgentOpenTicketCount: number;
  totalTicketCount: number;
  factors: string[];
};
