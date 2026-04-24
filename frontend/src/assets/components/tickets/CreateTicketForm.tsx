import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryOptions, priorityOptions, mockResources } from "../../data/ticketData";
import type { CreateTicketRequest } from "../../types/ticket";
import * as ticketService from "../../services/ticketService";

const CreateTicketForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateTicketRequest>({
    category: categoryOptions[0].value,
    description: "",
    priority: priorityOptions[0].value,
    preferredContact: "",
    resourceId: "",
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<CreateTicketRequest>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<CreateTicketRequest> = {};
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.preferredContact.trim()) newErrors.preferredContact = "Contact is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (selected.length + attachments.length > 3) {
        alert("Maximum 3 images allowed.");
        return;
      }
      setAttachments([...attachments, ...selected]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await ticketService.createTicket({
        userId: 1,
        resourceId: undefined,
        category: form.category,
        priority: form.priority,
        description: form.description,
        preferredContact: form.preferredContact,
      });

      // Upload attachments if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          await ticketService.uploadAttachment(created.ticketId, file);
        }
      }

      alert("Ticket created successfully!");
      navigate("/tickets");
    } catch (err) {
      alert("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", padding: "2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>
            Create Incident Ticket
          </h2>
          <p style={{ color: "#666", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Report a fault or maintenance issue
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Description */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            {errors.description && <span style={errorStyle}>{errors.description}</span>}
          </div>

          {/* Resource */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={labelStyle}>Resource (Optional)</label>
            <select name="resourceId" value={form.resourceId} onChange={handleChange} style={inputStyle}>
              <option value="">-- Select Resource --</option>
              {mockResources.map((r: { id: string; name: string }) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={labelStyle}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
              {categoryOptions.map((c: { value: string; label: string }) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={labelStyle}>Priority *</label>
            <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
              {priorityOptions.map((p: { value: string; label: string }) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Preferred Contact */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={labelStyle}>Preferred Contact *</label>
            <input
              name="preferredContact"
              value={form.preferredContact}
              onChange={handleChange}
              placeholder="Email or phone number"
              style={inputStyle}
            />
            {errors.preferredContact && <span style={errorStyle}>{errors.preferredContact}</span>}
          </div>

          {/* Attachments */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Attachments (Max 3 images)</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              onChange={handleFileChange}
              style={{ display: "block", marginTop: "0.4rem" }}
            />
            {attachments.length > 0 && (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                {attachments.map((file, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      style={{ position: "absolute", top: "-6px", right: "-6px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "0.7rem" }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "600" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", background: submitting ? "#999" : "#1a3a6b", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight: "600" }}
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: "600", marginBottom: "0.4rem", fontSize: "0.9rem", color: "#333",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ddd",
  fontSize: "0.95rem", boxSizing: "border-box", outline: "none",
};
const errorStyle: React.CSSProperties = {
  color: "#e74c3c", fontSize: "0.8rem", marginTop: "0.25rem", display: "block",
};

export default CreateTicketForm;