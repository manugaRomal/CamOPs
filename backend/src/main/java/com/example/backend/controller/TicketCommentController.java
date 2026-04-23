package com.example.backend.controller;

import com.example.backend.domain.TicketComment;
import com.example.backend.service.TicketCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketCommentController {

    @Autowired
    private TicketCommentService ticketCommentService;

    // GET /api/tickets/{ticketId}/comments — get all comments by ticket
    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getCommentsByTicket(
            @PathVariable Long ticketId) {
        List<TicketComment> comments = ticketCommentService.getCommentsByTicket(ticketId);
        return ResponseEntity.ok(comments);
    }

    // POST /api/tickets/{ticketId}/comments — add comment
    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long ticketId,
            @RequestBody TicketComment comment) {
        try {
            comment.setTicketId(ticketId);
            TicketComment created = ticketCommentService.addComment(comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // PUT /api/comments/{commentId} — edit comment
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> editComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, String> body) {
        try {
            String newText = body.get("commentText");
            Long userId = Long.parseLong(body.get("userId"));
            TicketComment updated = ticketCommentService.editComment(commentId, newText, userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/comments/{commentId} — delete comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        try {
            ticketCommentService.deleteComment(commentId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.notFound().build();
        }
    }
}