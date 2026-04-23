package com.example.backend.repository;

import com.example.backend.domain.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    // Find all attachments by ticket
    List<TicketAttachment> findByTicketId(Long ticketId);

    // Count attachments by ticket
    long countByTicketId(Long ticketId);
}