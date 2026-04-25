package com.example.backend.service;

import com.example.backend.controller.dto.CurrentUserResponse;
import com.example.backend.controller.dto.ProfilePatchRequest;
import com.example.backend.domain.RoleEntity;
import com.example.backend.domain.UserEntity;
import com.example.backend.domain.UserRoleEntity;
import com.example.backend.repository.RoleEntityRepository;
import com.example.backend.repository.UserEntityRepository;
import com.example.backend.repository.UserRoleEntityRepository;
import com.example.backend.security.AppRoles;
import com.example.backend.security.CamUserPrincipal;
import com.example.backend.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserAccountService {

    public static final String DEFAULT_ROLE = AppRoles.STUDENT;

    private final UserEntityRepository userEntityRepository;
    private final RoleEntityRepository roleEntityRepository;
    private final UserRoleEntityRepository userRoleEntityRepository;
    private final JwtService jwtService;

    public UserAccountService(
            UserEntityRepository userEntityRepository,
            RoleEntityRepository roleEntityRepository,
            UserRoleEntityRepository userRoleEntityRepository,
            JwtService jwtService
    ) {
        this.userEntityRepository = userEntityRepository;
        this.roleEntityRepository = roleEntityRepository;
        this.userRoleEntityRepository = userRoleEntityRepository;
        this.jwtService = jwtService;
    }

    public String issueJwtForUser(UserEntity user) {
        List<String> roles = loadRoleNames(user.getUserId());
        return jwtService.generateToken(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfileImageUrl() != null ? user.getProfileImageUrl() : "",
                roles
        );
    }

    public CamUserPrincipal toPrincipal(UserEntity user, List<String> roleNames) {
        return new CamUserPrincipal(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfileImageUrl() != null ? user.getProfileImageUrl() : "",
                roleNames
        );
    }

    public List<String> loadRoleNames(long userId) {
        return userRoleEntityRepository.findByUserIdWithRole(userId).stream()
                .map(ur -> ur.getRole().getRoleName())
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> findById(long id) {
        return userEntityRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> findByEmail(String email) {
        return userEntityRepository.findByEmail(email);
    }

    /**
     * Create or update user from Google OAuth2 attributes, ensure default role.
     */
    public UserEntity upsertFromOAuth(String sub, String email, String name, String picture) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Google account has no email");
        }
        Optional<UserEntity> bySub = sub != null && !sub.isBlank() ? userEntityRepository.findByGoogleSub(sub) : Optional.empty();
        Optional<UserEntity> byEmail = userEntityRepository.findByEmail(email);

        UserEntity user;
        if (bySub.isPresent()) {
            user = bySub.get();
        } else if (byEmail.isPresent()) {
            user = byEmail.get();
            if (sub != null && (user.getGoogleSub() == null || user.getGoogleSub().isBlank())) {
                user.setGoogleSub(sub);
            }
        } else {
            user = new UserEntity();
            user.setEmail(email);
            user.setGoogleSub(sub);
            user.setIsActive(true);
        }

        user.setFullName(name != null && !name.isBlank() ? name : email);
        if (picture != null && !picture.isBlank()) {
            user.setProfileImageUrl(picture);
        }
        user = userEntityRepository.save(user);

        if (userRoleEntityRepository.findByUserIdWithRole(user.getUserId()).isEmpty()) {
            ensureRoleAndAssign(user, DEFAULT_ROLE);
        }
        return user;
    }

    public void ensureRoleAndAssign(UserEntity user, String roleName) {
        RoleEntity role = roleEntityRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found in DB: " + roleName + " — run DB seed for Roles table."));
        if (userRoleEntityRepository.findByUserIdAndRoleId(user.getUserId(), role.getRoleId()).isEmpty()) {
            UserRoleEntity link = new UserRoleEntity();
            link.setUser(user);
            link.setRole(role);
            userRoleEntityRepository.save(link);
        }
    }

    public void addRoleToUser(long userId, String roleName) {
        if (roleName == null) {
            throw new IllegalArgumentException("roleName is required");
        }
        String name = roleName.toUpperCase();
        if (!AppRoles.ALL.contains(name)) {
            throw new IllegalArgumentException("Invalid role. Allowed: " + AppRoles.ALL);
        }
        UserEntity user = userEntityRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
        ensureRoleAndAssign(user, name);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse toCurrentUserResponse(long userId) {
        UserEntity u = userEntityRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
        return toCurrentUserResponse(u);
    }

    public CurrentUserResponse toCurrentUserResponse(UserEntity u) {
        CurrentUserResponse r = new CurrentUserResponse();
        r.setUserId(u.getUserId());
        r.setEmail(u.getEmail());
        r.setFullName(u.getFullName());
        r.setPhone(u.getPhone() != null ? u.getPhone() : "");
        r.setDepartment(u.getDepartment() != null ? u.getDepartment() : "");
        r.setProfileImageUrl(u.getProfileImageUrl() != null ? u.getProfileImageUrl() : "");
        r.setRoles(loadRoleNames(u.getUserId()));
        return r;
    }

    /**
     * Self-service: fullName, phone, department only. Email, roles, google_sub, is_active are not changed here.
     */
    public UserEntity updateProfile(long userId, ProfilePatchRequest body) {
        if (body.getFullName() == null && body.getPhone() == null && body.getDepartment() == null) {
            throw new IllegalArgumentException("At least one of fullName, phone, or department is required");
        }
        UserEntity u = userEntityRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));

        if (body.getFullName() != null) {
            String n = body.getFullName().trim();
            if (n.isEmpty()) {
                throw new IllegalArgumentException("fullName cannot be empty");
            }
            u.setFullName(n);
        }
        if (body.getPhone() != null) {
            String p = body.getPhone().trim();
            u.setPhone(p.isEmpty() ? null : p);
        }
        if (body.getDepartment() != null) {
            String d = body.getDepartment().trim();
            u.setDepartment(d.isEmpty() ? null : d);
        }
        return userEntityRepository.save(u);
    }
}
