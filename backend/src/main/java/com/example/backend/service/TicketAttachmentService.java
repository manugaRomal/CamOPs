package com.example.backend.service;

import com.example.backend.domain.TicketAttachment;
import com.example.backend.repository.TicketAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class TicketAttachmentService {

    @Autowired
    private TicketAttachmentRepository ticketAttachmentRepository;

    // Upload directory
    private final String uploadDir = "uploads/tickets/";

    // Get all attachments by ticket
    public List<TicketAttachment> getAttachmentsByTicket(Long ticketId) {
        return ticketAttachmentRepository.findByTicketId(ticketId);
    }

    // Upload attachment
    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) throws IOException {

        // Check max 3 attachments per ticket
        long count = ticketAttachmentRepository.countByTicketId(ticketId);
        if (count >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.equals("image/jpeg") &&
             !contentType.equals("image/png") &&
             !contentType.equals("image/jpg"))) {
            throw new RuntimeException("Only JPG, JPEG, and PNG images are allowed");
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique file name
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName != null ?
            originalFileName.substring(originalFileName.lastIndexOf(".")) : ".jpg";
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // Save file to disk
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save attachment record to database
        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicketId(ticketId);
        attachment.setFileName(originalFileName);
        attachment.setFileType(contentType);
        attachment.setFilePath(uploadDir + uniqueFileName);
        attachment.setFileSize(file.getSize());

        return ticketAttachmentRepository.save(attachment);
    }

    // Delete attachment
    public void deleteAttachment(Long attachmentId) throws IOException {
        TicketAttachment attachment = ticketAttachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Attachment not found with id: " + attachmentId));

        // Delete file from disk
        Path filePath = Paths.get(attachment.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Delete record from database
        ticketAttachmentRepository.deleteById(attachmentId);
    }
}