import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../../context/TicketContext";
import { TicketStatus } from "../../types/ticket";
import SLATimer from "./SLATimer";
import * as ticketService from "../../services/ticketService";

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

const mockTechnicians = [
  { id: 2, name: "Kamal Perera" },
  { id: 3, name: "Nimal Silva" },
  { id: 4, name: "Saman Fernando" },
];

interface AdminTicketDetailProps {
  ticketId: string;
}

interface Comment {
  commentId: number;
  ticketId: number;
  userId: number;
  commentText: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminTicketDetail = ({ ticketId }: AdminTicketDetailProps) => {
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, rejectTicket, refreshTickets } = useTickets();
  const ticket = tickets.find((t) => t.id === ticketId);

  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (ticketId) {
      ticketService.getCommentsByTicket(Number(ticketId))
        .then(setComments)
        .catch(() => setComments([]));
    }
  }, [ticketId]);

  if (!ticket) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
        Ticket not found.{" "}
        <span
          style={{ color: "#1a3a6b", cursor: "pointer" }}
          onClick={() => navigate("/admin/tickets")}
        >
          Go back
        </span>
      </div>
    );
  }

  const handleAssign = async () => {
    if (!selectedTechnician) {
      alert("Please select a technician first.");
      return;
    }
    try {
      await ticketService.assignTicket(Number(ticketId), selectedTechnician);
      await refreshTickets();
      alert("Ticket assigned to technician successfully!");
    } catch {
      alert("Failed to assign ticket.");
    }
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

  const handleClose = () => {
    updateTicketStatus(ticket.id, TicketStatus.CLOSED);
    alert("Ticket CLOSED!");
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const created = await ticketService.addComment(Number(ticketId), {
        userId: 99,
        commentText: newComment,
      });
      setComments([...comments, created]);
      setNewComment("");
    } catch {
      alert("Failed to add comment");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/tickets")}
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

          {/* SLA Timer */}
          <SLATimer
            createdAt={ticket.createdAt}
            priority={ticket.priority}
            status={ticket.status}
            resolvedAt={ticket.resolvedAt}
          />

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

          {/* Admin Action Buttons */}
          <div style={{ marginTop: "1.5rem" }}>

            {/* Assign to Technician - only for OPEN tickets */}
            {ticket.status === TicketStatus.OPEN && (
              <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <label style={detailLabel}>Assign to Technician</label>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <select
                    value={selectedTechnician ?? ""}
                    onChange={(e) => setSelectedTechnician(Number(e.target.value))}
                    style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                  >
                    <option value="">-- Select Technician --</option>
                    {mockTechnicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#1a3a6b", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Close ticket - for RESOLVED tickets */}
              {ticket.status === TicketStatus.RESOLVED && (
                <button
                  onClick={handleClose}
                  style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#95a5a6", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Close Ticket
                </button>
              )}

              {/* Reject - for OPEN or IN_PROGRESS tickets */}
              {(ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS) && (
                <button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Reject Ticket
                </button>
              )}
            </div>

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
        </div>

        {/* Comments Section */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "700", color: "#1a1a2e" }}>
            Comments ({comments.length})
          </h3>

          {comments.length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>No comments yet.</p>
          )}

          {comments.map((comment) => (
            <div key={comment.commentId} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#1a1a2e" }}>
                  User {comment.userId}
                  {comment.isEdited && <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: "0.5rem" }}>(edited)</span>}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#999" }}>
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <p style={{ margin: "0.4rem 0 0", color: "#444", fontSize: "0.9rem" }}>
                {comment.commentText}
              </p>
            </div>
          ))}

          {/* Add Comment */}
          <div style={{ marginTop: "1rem" }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment as admin..."
              rows={3}
              style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", resize: "vertical", fontSize: "0.9rem" }}
            />
            <button
              onClick={handleAddComment}
              style={{ marginTop: "0.5rem", padding: "0.6rem 1.4rem", borderRadius: "8px", border: "none", background: "#1a3a6b", color: "#fff", cursor: "pointer", fontWeight: "600" }}
            >
              Add Comment
            </button>
          </div>
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

export default AdminTicketDetail;