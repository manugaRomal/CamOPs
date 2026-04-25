package com.example.backend.security;

import java.util.Set;

/**
 * CamOPs uses exactly three application roles. Spring Security may prefix with
 * {@code ROLE_} in authorities; role names in the {@code Roles} table match these
 * string values.
 */
public final class AppRoles {

    public static final String ADMIN = "ADMIN";
    public static final String TECHNICIAN = "TECHNICIAN";
    public static final String STUDENT = "STUDENT";

    public static final Set<String> ALL = Set.of(ADMIN, TECHNICIAN, STUDENT);

    private AppRoles() {}
}
