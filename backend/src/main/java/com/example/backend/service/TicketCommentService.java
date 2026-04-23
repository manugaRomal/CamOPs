package com.example.backend.service;

import com.example.backend.domain.TicketComment;
import com.example.backend.repository.TicketCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketCommentService {

    @Autowired
    private TicketCommentRepository ticketCommentRepository;

    // Get all comments by ticket
    public List<TicketComment> getCommentsByTicket(Long ticketId) {
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    // Get comment by id
    public Optional<TicketComment> getCommentById(Long commentId) {
        return ticketCommentRepository.findById(commentId);
    }

    // Add comment
    public TicketComment addComment(TicketComment comment) {
        comment.setIsEdited(false);
        return ticketCommentRepository.save(comment);
    }

    // Edit comment
    public TicketComment editComment(Long commentId, String newText, Long userId) {
        Optional<TicketComment> optionalComment = ticketCommentRepository.findById(commentId);
        if (optionalComment.isEmpty()) {
            throw new RuntimeException("Comment not found with id: " + commentId);
        }
        TicketComment comment = optionalComment.get();

        // Check ownership
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own comments");
        }

        comment.setCommentText(newText);
        comment.setIsEdited(true);
        return ticketCommentRepository.save(comment);
    }

    // Delete comment
    public void deleteComment(Long commentId, Long userId) {
        Optional<TicketComment> optionalComment = ticketCommentRepository.findById(commentId);
        if (optionalComment.isEmpty()) {
            throw new RuntimeException("Comment not found with id: " + commentId);
        }
        TicketComment comment = optionalComment.get();

        // Check ownership
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own comments");
        }

        ticketCommentRepository.deleteById(commentId);
    }
}