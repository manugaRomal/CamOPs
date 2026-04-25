package com.example.backend.repository;

import com.example.backend.domain.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    @Modifying
    @Query("delete from TicketComment c where c.ticketId = :ticketId")
    void deleteByTicketId(@Param("ticketId") Long ticketId);
}
