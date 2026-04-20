import { useNavigate } from "react-router-dom";
import { useTickets } from "../../context/TicketContext";

const priorityColors: Record<string, string> = {
  LOW: "#27ae60",
  MEDIUM: "#f39c12",
  HIGH: "#e67e22",
  CRITICAL: "#e74c3c",
};

const statusColors: Record<string, string> = {
  OPEN: "#3498db",
  IN_PROGRESS: "#f39c12",
  RESOLVED: "#27ae60",
  CLOSED: "#95a5a6",
  REJECTED: "#e74c3c",
};

const TechnicianTicketList = () => {
  const navigate = useNavigate();
  const { tickets } = useTickets();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>
              Assigned Tickets
            </h2>
            <p style={{ color: "#666", marginTop: "0.25rem", fontSize: "0.9rem" }}>
              {tickets.length} ticket(s) to handle
            </p>
          </div>
          <button
            onClick={() => navigate("/technician")}
            style={{ padding: "0.6rem 1.4rem", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "600" }}
          >
            ← Dashboard
          </button>
        </div>

        {/* Ticket Cards */}
        {tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
            No tickets assigned.
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/technician/tickets/${ticket.id}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                padding: "1.2rem 1.5rem",
                marginBottom: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                borderLeft: `4px solid ${priorityColors[ticket.priority] ?? "#ccc"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#999", fontWeight: "600" }}>
                    {ticket.ticketCode}
                  </span>
                  <h3 style={{ margin: "0.2rem 0 0.4rem", fontSize: "1rem", fontWeight: "700", color: "#1a1a2e" }}>
                    {ticket.description.length > 80
                      ? ticket.description.substring(0, 80) + "..."
                      : ticket.description}
                  </h3>
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>
                    {ticket.resourceName ?? "No resource"} • {ticket.category.replace(/_/g, " ")}
                  </span>
                  <div style={{ marginTop: "0.4rem", fontSize: "0.82rem", color: "#888" }}>
                    Reported by: {ticket.reportedByName}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#888" }}>
                    Assigned to: {ticket.assignedToName ?? "Unassigned"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                  <span style={{
                    padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700",
                    backgroundColor: statusColors[ticket.status] + "22",
                    color: statusColors[ticket.status],
                  }}>
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                  <span style={{
                    padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700",
                    backgroundColor: priorityColors[ticket.priority] + "22",
                    color: priorityColors[ticket.priority],
                  }}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#999" }}>
                Created: {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TechnicianTicketList;