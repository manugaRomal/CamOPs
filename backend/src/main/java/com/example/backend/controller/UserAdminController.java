package com.example.backend.controller;

import com.example.backend.controller.dto.AssignRoleRequest;
import com.example.backend.controller.dto.RoleNameResponse;
import com.example.backend.domain.RoleEntity;
import com.example.backend.repository.RoleEntityRepository;
import com.example.backend.security.AppRoles;
import com.example.backend.service.UserAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {

    private final RoleEntityRepository roleEntityRepository;
    private final UserAccountService userAccountService;

    public UserAdminController(RoleEntityRepository roleEntityRepository, UserAccountService userAccountService) {
        this.roleEntityRepository = roleEntityRepository;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public RoleNameResponse listRoles() {
        List<String> names = roleEntityRepository.findAll().stream()
                .map(RoleEntity::getRoleName)
                .filter(AppRoles.ALL::contains)
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
        userAccountService.addRoleToUser(userId, body.getRoleName().toUpperCase());
        return ResponseEntity.noContent().build();
    }
}
