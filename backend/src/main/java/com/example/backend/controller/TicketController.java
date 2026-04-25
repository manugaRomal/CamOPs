package com.example.backend.controller;

import com.example.backend.dto.ticket.AddTicketCommentRequest;
import com.example.backend.dto.ticket.AssignTicketRequest;
import com.example.backend.dto.ticket.CreateTicketRequest;
import com.example.backend.dto.ticket.ResolveTicketRequest;
import com.example.backend.dto.ticket.TechnicianOptionDTO;
import com.example.backend.dto.ticket.TicketResponse;
import com.example.backend.dto.ticket.UpdateTicketRequest;
import com.example.backend.security.AuthPrincipal;
import com.example.backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    private static boolean isAdmin(Authentication auth) {
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private static boolean isTechnician(Authentication auth) {
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_TECHNICIAN".equals(a.getAuthority()) || "ROLE_STAFF".equals(a.getAuthority()));
    }

    private void requireUser(AuthPrincipal principal) {
        if (principal == null || principal.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public TicketResponse create(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        requireUser(principal);
        return ticketService.create(principal.getUserId(), request);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TechnicianOptionDTO> listTechnicians() {
        return ticketService.listTechnicians();
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<TicketResponse> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        requireUser(principal);
        return ticketService.list(
                principal.getUserId(),
                isAdmin(authentication),
                isTechnician(authentication)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public TicketResponse get(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        requireUser(principal);
        return ticketService.getById(
                id,
                principal.getUserId(),
                isAdmin(authentication),
                isTechnician(authentication)
        );
    }

    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public TicketResponse update(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        requireUser(principal);
        return ticketService.update(
                id,
                principal.getUserId(),
                isAdmin(authentication),
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void delete(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        requireUser(principal);
        ticketService.delete(id, principal.getUserId(), isAdmin(authentication));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketResponse assign(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignTicketRequest request
    ) {
        return ticketService.assign(id, request.getAssignedToUserId());
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public TicketResponse addComment(
            @PathVariable("id") Long id,
            @Valid @RequestBody AddTicketCommentRequest request,
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        requireUser(principal);
        return ticketService.addComment(id, principal.getUserId(), request);
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("isAuthenticated()")
    public TicketResponse resolve(
            @PathVariable("id") Long id,
            @Valid @RequestBody ResolveTicketRequest request,
            @AuthenticationPrincipal AuthPrincipal principal,
            Authentication authentication
    ) {
        requireUser(principal);
        return ticketService.resolve(
                id,
                principal.getUserId(),
                isAdmin(authentication),
                request
        );
    }
}
