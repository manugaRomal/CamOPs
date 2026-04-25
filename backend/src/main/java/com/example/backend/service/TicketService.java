package com.example.backend.service;

import com.example.backend.dto.ticket.*;

import java.util.List;

public interface TicketService {

    TicketResponse create(Long userId, CreateTicketRequest request);

    TicketResponse getById(Long ticketId, Long currentUserId, boolean isAdmin, boolean isTechnician);

    List<TicketResponse> list(Long currentUserId, boolean isAdmin, boolean isTechnician);

    TicketResponse assign(Long ticketId, Long assignedToUserId);

    TicketResponse addComment(Long ticketId, Long authorUserId, AddTicketCommentRequest request);

    TicketResponse resolve(Long ticketId, Long actorUserId, boolean isAdmin, ResolveTicketRequest request);

    TicketResponse update(
            Long ticketId,
            Long actorUserId,
            boolean isAdmin,
            UpdateTicketRequest request
    );

    void delete(Long ticketId, Long actorUserId, boolean isAdmin);

    List<TechnicianOptionDTO> listTechnicians();
}
