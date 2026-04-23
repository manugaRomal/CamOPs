package com.example.backend.repository;

import com.example.backend.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Find all tickets by user
    List<Ticket> findByUserId(Long userId);

    // Find all tickets by status
    List<Ticket> findByStatus(String status);

    // Find all tickets by priority
    List<Ticket> findByPriority(String priority);

    // Find all tickets by resource
    List<Ticket> findByResourceId(Long resourceId);

    // Find ticket by ticket code
    Ticket findByTicketCode(String ticketCode);

    // Find tickets by user and status
    List<Ticket> findByUserIdAndStatus(Long userId, String status);
}