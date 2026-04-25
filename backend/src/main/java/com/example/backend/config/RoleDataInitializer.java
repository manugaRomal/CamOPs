package com.example.backend.config;

import com.example.backend.domain.Role;
import com.example.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class RoleDataInitializer {

    /**
     * Must include {@code TECHNICIAN} so admin can grant it; ticket assign uses TECHNICIAN and STAFF.
     * {@code AppRoles} documents ADMIN, TECHNICIAN, STUDENT; STAFF/FACULTY are extra org roles.
     */
    private static final List<String> DEFAULT_ROLES = List.of(
            "ADMIN", "TECHNICIAN", "STAFF", "STUDENT", "FACULTY"
    );

    @Bean
    CommandLineRunner seedRolesIfEmpty(RoleRepository roleRepository) {
        return args -> {
            for (String name : DEFAULT_ROLES) {
                if (roleRepository.findByRoleName(name).isEmpty()) {
                    Role r = new Role();
                    r.setRoleName(name);
                    roleRepository.save(r);
                }
            }
        };
    }
}
