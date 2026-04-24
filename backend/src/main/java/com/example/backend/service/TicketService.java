package com.example.backend.service;

import com.example.backend.domain.Ticket;
import com.example.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Get ticket by id
    public Optional<Ticket> getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId);
    }

    // Get tickets by user
    public List<Ticket> getTicketsByUser(Long userId) {
        return ticketRepository.findByUserId(userId);
    }

    // Get tickets by status
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    // Create ticket
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus("OPEN");
        ticket.setPriority(ticket.getPriority() != null ? ticket.getPriority() : "MEDIUM");
        String ticketCode = "TKT-" + System.currentTimeMillis();
        ticket.setTicketCode(ticketCode);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Update ticket status
    public Ticket updateTicketStatus(Long ticketId, String status) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(ticketId);
        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        Ticket ticket = optionalTicket.get();
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (status.equals("RESOLVED")) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (status.equals("CLOSED")) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        return ticketRepository.save(ticket);
    }

    // Assign ticket to technician
    public Ticket assignTicket(Long ticketId, Long technicianId) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(ticketId);
        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        Ticket ticket = optionalTicket.get();
        ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Resolve ticket
    public Ticket resolveTicket(Long ticketId, String resolutionNotes) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(ticketId);
        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        Ticket ticket = optionalTicket.get();
        ticket.setStatus("RESOLVED");
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Reject ticket
    public Ticket rejectTicket(Long ticketId, String rejectionReason) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(ticketId);
        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        Ticket ticket = optionalTicket.get();
        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(rejectionReason);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Close ticket
    public Ticket closeTicket(Long ticketId) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(ticketId);
        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        Ticket ticket = optionalTicket.get();
        ticket.setStatus("CLOSED");
        ticket.setClosedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Delete ticket
    public void deleteTicket(Long ticketId) {
        ticketRepository.deleteById(ticketId);
    }
}