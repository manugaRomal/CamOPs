package com.example.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "Ticket_comment")
public class TicketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "is_edited")
    private Boolean edited = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public Boolean getEdited() {
        return edited;
    }

    public void setEdited(Boolean edited) {
        this.edited = edited;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
