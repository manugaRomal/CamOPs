package com.example.backend.repository;

import com.example.backend.domain.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    // Find all comments by ticket
    List<TicketComment> findByTicketId(Long ticketId);

    // Find all comments by user
    List<TicketComment> findByUserId(Long userId);

    // Find all comments by ticket ordered by created date
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}