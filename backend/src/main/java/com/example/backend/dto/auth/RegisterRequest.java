package com.example.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 150)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100)
    private String password;

    @Size(max = 30)
    private String phone = "";

    @Size(max = 100)
    private String department = "";

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
