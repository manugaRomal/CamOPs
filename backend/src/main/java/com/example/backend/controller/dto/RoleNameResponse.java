package com.example.backend.controller.dto;

import java.util.List;

public class RoleNameResponse {
    private List<String> roleNames;

    public RoleNameResponse() {}

    public RoleNameResponse(List<String> roleNames) {
        this.roleNames = roleNames;
    }

    public List<String> getRoleNames() {
        return roleNames;
    }

    public void setRoleNames(List<String> roleNames) {
        this.roleNames = roleNames;
    }
}
