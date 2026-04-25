package com.example.backend.controller;

import com.example.backend.controller.dto.AssignRoleRequest;
import com.example.backend.controller.dto.RoleNameResponse;
import com.example.backend.domain.Role;
import com.example.backend.domain.User;
import com.example.backend.domain.UserRoleLink;
import com.example.backend.dto.admin.AdminUserSummaryDTO;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {

    private final RoleRepository roleRepository;
    private final AuthService authService;
    private final UserRepository userRepository;

    public UserAdminController(
            RoleRepository roleRepository,
            AuthService authService,
            UserRepository userRepository
    ) {
        this.roleRepository = roleRepository;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserSummaryDTO> listUsersForAdmin() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(u -> u.getFullName() != null ? u.getFullName() : u.getEmail(), String.CASE_INSENSITIVE_ORDER))
                .map(this::toAdminSummary)
                .collect(Collectors.toList());
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public RoleNameResponse listRoles() {
        List<String> names = roleRepository.findAll().stream()
                .map(Role::getRoleName)
                .sorted()
                .toList();
        return new RoleNameResponse(names);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignRole(
            @PathVariable("id") long userId,
            @Valid @RequestBody AssignRoleRequest body
    ) {
        authService.addRoleToUser(userId, body.getRoleName().toUpperCase());
        return ResponseEntity.noContent().build();
    }

    private AdminUserSummaryDTO toAdminSummary(User u) {
        List<String> roleNames = u.getRoleLinks().stream()
                .map(UserRoleLink::getRole)
                .map(Role::getRoleName)
                .sorted()
                .collect(Collectors.toList());
        AdminUserSummaryDTO d = new AdminUserSummaryDTO();
        d.setId(u.getId());
        d.setFullName(u.getFullName());
        d.setEmail(u.getEmail());
        d.setDepartment(u.getDepartment());
        d.setActive(u.isActive());
        d.setRoles(roleNames);
        return d;
    }
}
