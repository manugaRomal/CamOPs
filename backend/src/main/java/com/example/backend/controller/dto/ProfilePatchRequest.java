package com.example.backend.controller.dto;

import jakarta.validation.constraints.Size;

/**
 * Partial update: fields not sent (null) are left unchanged. Empty string for phone or
 * department clears the value. For fullName, blank is invalid if the field is sent.
 */
public class ProfilePatchRequest {

    @Size(max = 150)
    private String fullName;

    @Size(max = 30)
    private String phone;

    @Size(max = 100)
    private String department;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
