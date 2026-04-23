package com.example.backend.controller;

import com.example.backend.domain.TicketAttachment;
import com.example.backend.service.TicketAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketAttachmentController {

    @Autowired
    private TicketAttachmentService ticketAttachmentService;

    // GET /api/tickets/{ticketId}/attachments — get all attachments by ticket
    @GetMapping("/tickets/{ticketId}/attachments")
    public ResponseEntity<List<TicketAttachment>> getAttachmentsByTicket(
            @PathVariable Long ticketId) {
        List<TicketAttachment> attachments = ticketAttachmentService.getAttachmentsByTicket(ticketId);
        return ResponseEntity.ok(attachments);
    }

    // POST /api/tickets/{ticketId}/attachments — upload attachment
    @PostMapping("/tickets/{ticketId}/attachments")
    public ResponseEntity<TicketAttachment> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) {
        try {
            TicketAttachment attachment = ticketAttachmentService.uploadAttachment(ticketId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE /api/attachments/{attachmentId} — delete attachment
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        try {
            ticketAttachmentService.deleteAttachment(attachmentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}