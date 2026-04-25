package com.example.backend.config;

import com.example.backend.domain.RoleEntity;
import com.example.backend.repository.RoleEntityRepository;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RoleDataInitializer implements ApplicationListener<ContextRefreshedEvent> {

    /** Product model: only three assignable names (see {@link com.example.backend.security.AppRoles}). */
    private static final List<String> ROLES = List.of("ADMIN", "TECHNICIAN", "STUDENT");

    private final RoleEntityRepository roleEntityRepository;
    private boolean done;

    public RoleDataInitializer(RoleEntityRepository roleEntityRepository) {
        this.roleEntityRepository = roleEntityRepository;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (done) {
            return;
        }
        for (String name : ROLES) {
            if (roleEntityRepository.findByRoleName(name).isEmpty()) {
                RoleEntity r = new RoleEntity();
                r.setRoleName(name);
                roleEntityRepository.save(r);
            }
        }
        done = true;
    }
}
