package com.example.backend.repository;

import com.example.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByGoogleSub(String googleSub);

    @Query("select distinct u from User u join u.roleLinks url join url.role r "
            + "where u.active = true and upper(r.roleName) = upper(:roleName) order by u.fullName, u.email")
    List<User> findActiveUsersByRoleName(@Param("roleName") String roleName);

    @Query("select distinct u from User u join u.roleLinks url join url.role r "
            + "where u.active = true and upper(r.roleName) in :roleNames order by u.fullName, u.email")
    List<User> findActiveUsersWithAnyRoleName(@Param("roleNames") Collection<String> roleNames);
}
