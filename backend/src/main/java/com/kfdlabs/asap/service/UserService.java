package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateUserRequest;
import com.kfdlabs.asap.dto.UpdateUserRequest;
import com.kfdlabs.asap.entity.*;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.*;

import static org.openapitools.jackson.nullable.JsonNullable.undefined;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserDetailsRepository userDetailsRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final TwoFactorService twoFactorService;
    private final UserAuthMethodsRepository userAuthMethodsRepository;

    @Lazy
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.user.not.found"));
    }

    public User getActiveUserById(UUID id) {
        return userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.user.not.found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.user.not.found"));
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    public boolean isMultiOrganizationUser(String email) {
        User user = getUserByEmail(email);
        return organizationMemberRepository.countByUserIdAndIsActiveTrue(user.getId()) > 1;
    }

    public User updateUser(UUID id, UpdateUserRequest request) {
        User user = getUserById(id);

        if (request.getFirstName() != null && !request.getFirstName().equals(undefined())) {
            user.setFirstName(request.getFirstName().orElse(""));
        }
        if (request.getLastName() != null && !request.getLastName().equals(undefined())) {
            user.setLastName(request.getLastName().orElse(""));
        }
        if (request.getPhone() != null && !request.getPhone().equals(undefined())) {
            user.setPhone(request.getPhone().orElse(null));
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().equals(undefined())) {
            var uri = request.getAvatarUrl().orElse(null);
            user.setAvatarUrl(uri != null ? uri.toString() : null);
        }

        return userRepository.save(user);
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.user.email.conflict");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        user = userRepository.save(user);

        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.organization.not.found"));

            String role = (request.getRoles() != null && !request.getRoles().isEmpty())
                    ? request.getRoles().get(0).getValue().toLowerCase()
                    : "member";

            OrganizationMember member = new OrganizationMember();
            member.setOrganization(org);
            member.setUser(user);
            member.setRole(role);
            member.setJoinedAt(LocalDateTime.now());
            member.setIsActive(true);
            organizationMemberRepository.save(member);
        }

        if (Boolean.TRUE.equals(request.getSendEmail())) {
            String orgName = request.getOrganizationId() != null
                    ? organizationRepository.findById(request.getOrganizationId()).map(Organization::getName).orElse("ASAP")
                    : "ASAP";
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), orgName);
        }

        log.info("User created: {}", user.getId());
        return user;
    }

    public Optional<String> getUserPassword(String email) {
        return userDetailsRepository.findByEmailWithPassword(email)
                .map(UserDetails::getPassword);
    }

    public void setUserPassword(String email, String encodedPassword) {
        UserDetails userDetails = userDetailsRepository.findByEmail(email)
                .orElseGet(() -> createUserDetails(email));
        userDetails.setPassword(encodedPassword);
        userDetailsRepository.save(userDetails);
    }

    private UserDetails createUserDetails(String email) {
        UserDetails userDetails = new UserDetails();
        userDetails.setEmail(email);
        userDetails.setTwoFactorAuthEnabled(false);
        return userDetailsRepository.save(userDetails);
    }

    private void validatePasswordComplexity(String password) {
        if (password == null || password.length() < 8) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.password.too.short");
        }
        if (password.length() > 128) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.password.too.long");
        }
        boolean hasUpper = false, hasLower = false, hasDigit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
        }
        if (!hasUpper || !hasLower || !hasDigit) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                    "error.password.must.contain.uppercase.lowercase.digit");
        }
    }

    public void updateCurrentUserPassword(com.kfdlabs.asap.dto.UpdatePasswordRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        String email = SecurityUtils.getCurrentUserEmail();
        log.info("Updating password for user: {}", userId);

        if (request == null || request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.new.password.required");
        }

        validatePasswordComplexity(request.getNewPassword());

        if (twoFactorService.isTwoFactorEnabled(email)) {
            var code = request.getTwoFactorAuthCode();
            if (code == null || code.isBlank()) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.2fa.code.required");
            }
            var ud = userDetailsRepository.findByEmail(email)
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.user.details.not.found"));
            var secret = ud.getTwoFactorAuthSecret();
            if (secret == null || !twoFactorService.verifyCode(secret, code)) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.2fa.invalid.verification.code");
            }
        }

        var currentPasswordOpt = getUserPassword(email);
        if (currentPasswordOpt.isPresent()) {
            var oldPassword = request.getOldPassword();
            if (oldPassword == null || !passwordEncoder.matches(oldPassword, currentPasswordOpt.get())) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.password.incorrect");
            }
        }

        setUserPassword(email, passwordEncoder.encode(request.getNewPassword()));

        var authMethods = userAuthMethodsRepository.findByEmail(email).orElseGet(() -> {
            var m = new UserAuthMethods();
            m.setEmail(email);
            return userAuthMethodsRepository.save(m);
        });
        if (Boolean.FALSE.equals(authMethods.getPasswordEnabled())) {
            authMethods.setPasswordEnabled(true);
            userAuthMethodsRepository.save(authMethods);
        }
    }

    public UserAuthMethods getUserAuthMethods(String email) {
        if (!existsByEmail(email)) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.user.not.found");
        }
        return userAuthMethodsRepository.findByEmail(email)
                .orElseGet(() -> {
                    var authMethods = new UserAuthMethods();
                    authMethods.setEmail(email);
                    authMethods.setPasswordEnabled(true);
                    authMethods.setLoginLinkEnabled(true);
                    authMethods.setGoogleEnabled(true);
                    return userAuthMethodsRepository.save(authMethods);
                });
    }

    public UserAuthMethods getCurrentUserAuthMethods() {
        return getUserAuthMethods(SecurityUtils.getCurrentUserEmail());
    }

    public UserAuthMethods updateCurrentUserAuthMethods(com.kfdlabs.asap.dto.UpdateAuthMethodsRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        String email = SecurityUtils.getCurrentUserEmail();
        log.info("Updating auth methods for user: {}", userId);

        if (twoFactorService.isTwoFactorEnabled(email)) {
            var code = request.getTwoFactorAuthCode();
            if (code == null || code.isBlank()) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.2fa.code.required");
            }
            var ud = userDetailsRepository.findByEmail(email)
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.user.details.not.found"));
            var secret = ud.getTwoFactorAuthSecret();
            if (secret == null || !twoFactorService.verifyCode(secret, code)) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.2fa.invalid.verification.code");
            }
        }

        boolean hasAtLeastOneEnabled = Boolean.TRUE.equals(request.getPasswordEnabled()) ||
                Boolean.TRUE.equals(request.getLoginLinkEnabled()) ||
                Boolean.TRUE.equals(request.getGoogleEnabled());
        if (!hasAtLeastOneEnabled) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.at.least.one.auth.method.required");
        }

        var authMethods = userAuthMethodsRepository.findByEmail(email)
                .orElseGet(() -> {
                    var m = new UserAuthMethods();
                    m.setEmail(email);
                    return m;
                });

        authMethods.setPasswordEnabled(request.getPasswordEnabled());
        authMethods.setLoginLinkEnabled(request.getLoginLinkEnabled());
        authMethods.setGoogleEnabled(request.getGoogleEnabled());

        return userAuthMethodsRepository.save(authMethods);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    public void deleteUserById(UUID id) {
        User user = getUserById(id);
        if (user.getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.user.cannot.delete.current.user");
        }
        user.setIsActive(false);
        userRepository.save(user);
    }

    public Page<User> findAllUsers(String query, Integer page, Integer size, String sortBy, String order) {
        return userRepository.findAllUsers(
                query == null ? "" : query,
                PaginationUtils.getPageable(page, size, order, sortBy)
        );
    }

    public Page<User> findUsersByOrganization(UUID organizationId, String query,
                                               Integer page, Integer size, String sortBy, String order) {
        return userRepository.findUsersByOrganization(
                organizationId,
                query == null ? "" : query,
                PaginationUtils.getPageable(page, size, order, sortBy)
        );
    }

    public String getUserRoleInOrganization(UUID userId, UUID organizationId) {
        if (organizationId == null) return null;
        return organizationMemberRepository.findByOrganizationIdAndUserIdAndIsActiveTrue(organizationId, userId)
                .map(OrganizationMember::getRole)
                .orElse(null);
    }
}
