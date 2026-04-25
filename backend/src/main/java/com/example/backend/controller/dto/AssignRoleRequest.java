package com.example.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignRoleRequest {

    @NotBlank
    private String roleName;

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
