package com.example.backend.service;

import com.example.backend.domain.Ticket;
import com.example.backend.domain.TicketComment;
import com.example.backend.domain.User;
import com.example.backend.dto.ticket.*;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ResourceRepository;
import com.example.backend.repository.TicketCommentRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    public static final String STATUS_OPEN = "OPEN";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_RESOLVED = "RESOLVED";
    public static final String STATUS_CLOSED = "CLOSED";

    public static final String PRIORITY_DEFAULT = "MEDIUM";

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            TicketCommentRepository ticketCommentRepository,
            UserRepository userRepository,
            ResourceRepository resourceRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    public TicketResponse create(Long userId, CreateTicketRequest request) {
        if (request.getResourceId() != null) {
            resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new BadRequestException("Invalid resource_id"));
        }
        Ticket t = new Ticket();
        t.setUserId(userId);
        t.setTitle(request.getTitle().trim());
        t.setDescription(request.getDescription().trim());
        t.setCategory(request.getCategory().trim());
        String p = request.getPriority() != null && !request.getPriority().isBlank()
                ? request.getPriority().trim().toUpperCase()
                : PRIORITY_DEFAULT;
        t.setPriority(p);
        t.setStatus(STATUS_OPEN);
        t.setResourceId(request.getResourceId());
        t.setPreferredContact(
                request.getPreferredContact() != null ? request.getPreferredContact().trim() : null
        );
        t.setTicketCode("TMP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        t = ticketRepository.save(t);
        t.setTicketCode("TKT-" + t.getTicketId());
        t = ticketRepository.save(t);
        return toResponse(t, true);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getById(Long ticketId, Long currentUserId, boolean isAdmin, boolean isTechnician) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        assertCanView(t, currentUserId, isAdmin, isTechnician);
        return toResponse(t, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> list(Long currentUserId, boolean isAdmin, boolean isTechnician) {
        List<Ticket> list;
        if (isAdmin) {
            list = ticketRepository.findAllOrderByCreatedAtDesc();
        } else if (isTechnician) {
            list = ticketRepository.findForTechnicianUser(currentUserId);
        } else {
            list = ticketRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
        }
        return list.stream().map(t -> toResponse(t, false)).collect(Collectors.toList());
    }

    @Override
    public TicketResponse assign(Long ticketId, Long assignedToUserId) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User assignee = userRepository.findById(assignedToUserId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!assignee.isActive()) {
            throw new BadRequestException("User is not active");
        }
        if (!hasTechnicianOrStaffRole(assignee)) {
            throw new BadRequestException("Only users with the TECHNICIAN or STAFF role can be assigned");
        }
        t.setAssignedToUserId(assignedToUserId);
        if (STATUS_OPEN.equalsIgnoreCase(t.getStatus() != null ? t.getStatus() : "")) {
            t.setStatus(STATUS_IN_PROGRESS);
        }
        return toResponse(ticketRepository.save(t), true);
    }

    @Override
    public TicketResponse addComment(Long ticketId, Long authorUserId, AddTicketCommentRequest request) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User author = userRepository.findById(authorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isAdmin = userHasAdminRole(author);
        assertCanView(t, authorUserId, isAdmin, hasTechnicianOrStaffRole(author));
        TicketComment c = new TicketComment();
        c.setTicketId(ticketId);
        c.setUserId(authorUserId);
        c.setCommentText(request.getText().trim());
        ticketCommentRepository.save(c);
        t = ticketRepository.findById(ticketId).orElseThrow();
        return toResponse(t, true);
    }

    @Override
    public TicketResponse resolve(Long ticketId, Long actorUserId, boolean isAdmin, ResolveTicketRequest request) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (!isAdmin) {
            if (t.getAssignedToUserId() == null || !t.getAssignedToUserId().equals(actorUserId)) {
                throw new BadRequestException("Only the assigned technician or an admin can resolve this ticket");
            }
        }
        if (STATUS_RESOLVED.equalsIgnoreCase(t.getStatus() != null ? t.getStatus() : "")
                || STATUS_CLOSED.equalsIgnoreCase(t.getStatus() != null ? t.getStatus() : "")) {
            throw new BadRequestException("Ticket is already closed or resolved");
        }
        t.setStatus(STATUS_RESOLVED);
        t.setResolutionNotes(request.getResolutionNotes().trim());
        t.setResolvedAt(LocalDateTime.now());
        return toResponse(ticketRepository.save(t), true);
    }

    @Override
    public TicketResponse update(Long ticketId, Long actorUserId, boolean isAdmin, UpdateTicketRequest request) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        boolean isOwner = t.getUserId() != null && t.getUserId().equals(actorUserId);
        if (!isAdmin && !isOwner) {
            throw new BadRequestException("Only the requester or an admin can update this ticket");
        }
        if (!isAdmin) {
            String st = t.getStatus() != null ? t.getStatus() : "";
            if (!STATUS_OPEN.equalsIgnoreCase(st)) {
                throw new BadRequestException("You can only edit a ticket while it is OPEN. Contact support or an admin for changes.");
            }
        }
        if (!hasAnyUpdate(request)) {
            throw new BadRequestException("Nothing to update");
        }
        if (request.getTitle() != null) {
            t.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            t.setDescription(request.getDescription().trim());
        }
        if (request.getCategory() != null) {
            t.setCategory(request.getCategory().trim());
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            t.setPriority(request.getPriority().trim().toUpperCase());
        }
        if (request.getResourceId() != null) {
            if (request.getResourceId() > 0) {
                resourceRepository.findById(request.getResourceId())
                        .orElseThrow(() -> new BadRequestException("Invalid resource_id"));
                t.setResourceId(request.getResourceId());
            } else {
                t.setResourceId(null);
            }
        }
        if (request.getPreferredContact() != null) {
            String pc = request.getPreferredContact().trim();
            t.setPreferredContact(pc.isEmpty() ? null : pc);
        }
        return toResponse(ticketRepository.save(t), true);
    }

    private static boolean hasAnyUpdate(UpdateTicketRequest r) {
        return r.getTitle() != null
                || r.getDescription() != null
                || r.getCategory() != null
                || r.getPriority() != null
                || r.getResourceId() != null
                || r.getPreferredContact() != null;
    }

    @Override
    public void delete(Long ticketId, Long actorUserId, boolean isAdmin) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        boolean isOwner = t.getUserId() != null && t.getUserId().equals(actorUserId);
        if (!isAdmin && !isOwner) {
            throw new BadRequestException("Only the requester or an admin can delete this ticket");
        }
        if (!isAdmin) {
            String st = t.getStatus() != null ? t.getStatus() : "";
            if (!STATUS_OPEN.equalsIgnoreCase(st)) {
                throw new BadRequestException("You can only delete a ticket while it is OPEN. Ask an admin to close it if needed.");
            }
        }
        ticketCommentRepository.deleteByTicketId(ticketId);
        ticketRepository.delete(t);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianOptionDTO> listTechnicians() {
        return userRepository.findActiveUsersWithAnyRoleName(Set.of("TECHNICIAN", "STAFF")).stream()
                .map(u -> {
                    TechnicianOptionDTO d = new TechnicianOptionDTO();
                    d.setId(u.getId() != null ? u.getId() : 0L);
                    d.setFullName(u.getFullName());
                    d.setEmail(u.getEmail());
                    return d;
                })
                .collect(Collectors.toList());
    }

    private void assertCanView(Ticket t, Long userId, boolean isAdmin, boolean isTechnician) {
        if (isAdmin) {
            return;
        }
        if (t.getUserId() != null && t.getUserId().equals(userId)) {
            return;
        }
        if (isTechnician && t.getAssignedToUserId() != null && t.getAssignedToUserId().equals(userId)) {
            return;
        }
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                "Not allowed to view this ticket"
        );
    }

    /** Same notion as frontend {@code isTechnician}: TECHNICIAN or STAFF can be assigned and act on tickets. */
    private boolean hasTechnicianOrStaffRole(User u) {
        return u.getRoleLinks().stream().anyMatch(rl -> {
            String n = rl.getRole().getRoleName();
            if (n == null) {
                return false;
            }
            String up = n.toUpperCase();
            return "TECHNICIAN".equals(up) || "STAFF".equals(up);
        });
    }

    private boolean userHasAdminRole(User u) {
        return u.getRoleLinks().stream().anyMatch(rl -> {
            String n = rl.getRole().getRoleName();
            return n != null && "ADMIN".equalsIgnoreCase(n);
        });
    }

    private TicketResponse toResponse(Ticket t, boolean withComments) {
        TicketResponse r = new TicketResponse();
        r.setTicketId(t.getTicketId());
        r.setTicketCode(t.getTicketCode());
        r.setUserId(t.getUserId());
        r.setResourceId(t.getResourceId());
        r.setTitle(t.getTitle());
        r.setCategory(t.getCategory());
        r.setPriority(t.getPriority());
        r.setStatus(t.getStatus());
        r.setDescription(t.getDescription());
        r.setPreferredContact(t.getPreferredContact());
        r.setAssignedToUserId(t.getAssignedToUserId());
        r.setResolutionNotes(t.getResolutionNotes());
        r.setResolvedAt(t.getResolvedAt());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());

        userRepository.findById(t.getUserId()).ifPresent(u -> {
            r.setRequesterName(u.getFullName());
            r.setRequesterEmail(u.getEmail());
        });
        if (t.getAssignedToUserId() != null) {
            userRepository.findById(t.getAssignedToUserId()).ifPresent(u -> {
                r.setAssigneeName(u.getFullName());
                r.setAssigneeEmail(u.getEmail());
            });
        }
        if (t.getResourceId() != null) {
            resourceRepository.findById(t.getResourceId()).ifPresent(res -> r.setResourceName(res.getResourceName()));
        }
        if (withComments) {
            List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(t.getTicketId());
            r.setComments(
                    comments.stream()
                            .map(this::toCommentResponse)
                            .collect(Collectors.toList())
            );
        }
        return r;
    }

    private TicketCommentResponse toCommentResponse(TicketComment c) {
        TicketCommentResponse x = new TicketCommentResponse();
        x.setCommentId(c.getCommentId());
        x.setUserId(c.getUserId());
        x.setCommentText(c.getCommentText());
        x.setCreatedAt(c.getCreatedAt());
        userRepository.findById(c.getUserId()).ifPresent(u -> x.setAuthorName(u.getFullName()));
        return x;
    }
}
