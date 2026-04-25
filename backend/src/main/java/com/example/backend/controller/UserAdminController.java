package com.example.backend.controller;

import com.example.backend.controller.dto.AssignRoleRequest;
import com.example.backend.controller.dto.RoleNameResponse;
import com.example.backend.domain.Role;
import com.example.backend.repository.RoleRepository;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {

    private final RoleRepository roleRepository;
    private final AuthService authService;

    public UserAdminController(RoleRepository roleRepository, AuthService authService) {
        this.roleRepository = roleRepository;
        this.authService = authService;
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
}
