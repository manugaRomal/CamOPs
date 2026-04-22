import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../../context/TicketContext";
import { TicketStatus } from "../../types/ticket";

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

interface TechnicianTicketDetailProps {
  ticketId: string;
}

const TechnicianTicketDetail = ({ ticketId }: TechnicianTicketDetailProps) => {
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, assignTicket, rejectTicket } = useTickets();
  const ticket = tickets.find((t) => t.id === ticketId);

  const [resolutionNotes, setResolutionNotes] = useState(ticket?.resolutionNotes ?? "");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!ticket) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
        Ticket not found.{" "}
        <span
          style={{ color: "#1a3a6b", cursor: "pointer" }}
          onClick={() => navigate("/technician/tickets")}
        >
          Go back
        </span>
      </div>
    );
  }

  const handleAssign = () => {
    assignTicket(ticket.id, "tech1", "Kamal Perera");
    updateTicketStatus(ticket.id, TicketStatus.IN_PROGRESS);
    alert("Ticket assigned and marked as IN PROGRESS!");
  };

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      alert("Please add resolution notes before resolving.");
      return;
    }
    updateTicketStatus(ticket.id, TicketStatus.RESOLVED, resolutionNotes);
    setShowResolveForm(false);
    alert("Ticket marked as RESOLVED!");
  };

  const handleClose = () => {
    updateTicketStatus(ticket.id, TicketStatus.CLOSED);
    alert("Ticket CLOSED!");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please add a rejection reason.");
      return;
    }
    rejectTicket(ticket.id, rejectionReason);
    setShowRejectForm(false);
    alert("Ticket REJECTED!");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate("/technician/tickets")}
          style={{ marginBottom: "1rem", padding: "0.5rem 1.2rem", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "600" }}
        >
          ← Back to Tickets
        </button>

        {/* Ticket Header Card */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: "1.5rem" }}>

          {/* Title and Badges */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#999", fontWeight: "600" }}>
                {ticket.ticketCode}
              </span>
              <h2 style={{ margin: "0.3rem 0", fontSize: "1.3rem", fontWeight: "700", color: "#1a1a2e" }}>
                {ticket.description}
              </h2>
              <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                {ticket.resourceName ?? "No resource"} • {ticket.category.replace(/_/g, " ")}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end" }}>
              <span style={{
                padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700",
                backgroundColor: statusColors[ticket.status] + "22",
                color: statusColors[ticket.status],
              }}>
                {ticket.status.replace(/_/g, " ")}
              </span>
              <span style={{
                padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700",
                backgroundColor: priorityColors[ticket.priority] + "22",
                color: priorityColors[ticket.priority],
              }}>
                {ticket.priority}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.2rem" }}>
            <div>
              <span style={detailLabel}>Reported By</span>
              <span style={detailValue}>{ticket.reportedByName}</span>
            </div>
            <div>
              <span style={detailLabel}>Assigned To</span>
              <span style={detailValue}>{ticket.assignedToName ?? "Unassigned"}</span>
            </div>
            <div>
              <span style={detailLabel}>Preferred Contact</span>
              <span style={detailValue}>{ticket.preferredContact}</span>
            </div>
            <div>
              <span style={detailLabel}>Created At</span>
              <span style={detailValue}>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <span style={detailLabel}>Attachments</span>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                {ticket.attachments.map((att) => (
                  <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer">
                    <img
                      src={att.fileUrl}
                      alt={att.fileName}
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {ticket.resolutionNotes && (
            <div style={{ marginTop: "1rem", padding: "0.8rem", backgroundColor: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #27ae60" }}>
              <span style={detailLabel}>Resolution Notes</span>
              <p style={{ margin: 0, color: "#333", fontSize: "0.9rem" }}>{ticket.resolutionNotes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {ticket.rejectionReason && (
            <div style={{ marginTop: "1rem", padding: "0.8rem", backgroundColor: "#fff5f5", borderRadius: "8px", borderLeft: "4px solid #e74c3c" }}>
              <span style={detailLabel}>Rejection Reason</span>
              <p style={{ margin: 0, color: "#333", fontSize: "0.9rem" }}>{ticket.rejectionReason}</p>
            </div>
          )}

          {/* Technician Action Buttons */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>

            {/* Accept & Start */}
            {ticket.status === TicketStatus.OPEN && (
              <button
                onClick={handleAssign}
                style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#f39c12", color: "#fff", cursor: "pointer", fontWeight: "600" }}
              >
                Accept & Start Progress
              </button>
            )}

            {/* Resolve */}
            {ticket.status === TicketStatus.IN_PROGRESS && (
              <button
                onClick={() => setShowResolveForm(!showResolveForm)}
                style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#27ae60", color: "#fff", cursor: "pointer", fontWeight: "600" }}
              >
                Mark as Resolved
              </button>
            )}

            {/* Close */}
            {ticket.status === TicketStatus.RESOLVED && (
              <button
                onClick={handleClose}
                style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#95a5a6", color: "#fff", cursor: "pointer", fontWeight: "600" }}
              >
                Close Ticket
              </button>
            )}

            {/* Reject */}
            {(ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS) && (
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer", fontWeight: "600" }}
              >
                Reject Ticket
              </button>
            )}

          </div>

          {/* Resolve Form */}
          {showResolveForm && (
            <div style={{ marginTop: "1rem" }}>
              <label style={detailLabel}>Resolution Notes *</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                rows={3}
                style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", resize: "vertical", fontSize: "0.9rem" }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  onClick={handleResolve}
                  style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#27ae60", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Confirm Resolve
                </button>
                <button
                  onClick={() => setShowResolveForm(false)}
                  style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div style={{ marginTop: "1rem" }}>
              <label style={detailLabel}>Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describe why this ticket is being rejected..."
                rows={3}
                style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", resize: "vertical", fontSize: "0.9rem" }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  onClick={handleReject}
                  style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Comments Section */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "700", color: "#1a1a2e" }}>
            Comments ({ticket.comments.length})
          </h3>

          {ticket.comments.length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>No comments yet.</p>
          )}

          {ticket.comments.map((comment) => (
            <div key={comment.id} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#1a1a2e" }}>
                  {comment.userName}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#999" }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: "0.4rem 0 0", color: "#444", fontSize: "0.9rem" }}>
                {comment.commentText}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

const detailLabel: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", color: "#999", fontWeight: "600", marginBottom: "0.2rem",
};
const detailValue: React.CSSProperties = {
  display: "block", fontSize: "0.9rem", color: "#333", fontWeight: "500",
};

export default TechnicianTicketDetail;