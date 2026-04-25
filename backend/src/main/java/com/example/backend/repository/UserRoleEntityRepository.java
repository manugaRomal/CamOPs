package com.example.backend.repository;

import com.example.backend.domain.UserRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRoleEntityRepository extends JpaRepository<UserRoleEntity, Long> {

    @Query("select ur from UserRoleEntity ur join fetch ur.role where ur.user.userId = :userId")
    List<UserRoleEntity> findByUserIdWithRole(@Param("userId") Long userId);

    @Query("select ur from UserRoleEntity ur where ur.user.userId = :userId and ur.role.roleId = :roleId")
    Optional<UserRoleEntity> findByUserIdAndRoleId(@Param("userId") Long userId, @Param("roleId") Integer roleId);
}
