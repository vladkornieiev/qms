package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.LoginLink;
import com.kfdlabs.asap.entity.OrganizationMember;
import com.kfdlabs.asap.entity.PasswordResetToken;
import com.kfdlabs.asap.entity.User;
import com.kfdlabs.asap.entity.UserDetails;
import com.kfdlabs.asap.repository.LoginLinkRepository;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.repository.PasswordResetTokenRepository;
import com.kfdlabs.asap.repository.UserDetailsRepository;
import com.kfdlabs.asap.security.JwtUtil;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final LoginLinkRepository loginLinkRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserService userService;
    private final UserDetailsRepository userDetailsRepository;
    private final EmailService emailService;
    private final TwoFactorService twoFactorService;
    private final JwtUtil jwtUtil;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.mail.link-expiration-minutes:15}")
    private int loginLinkExpirationMinutes;

    @Value("${app.mail.reset-expiration-hours:1}")
    private int passwordResetExpirationHours;

    @Value("${app.security.max-login-attempts:5}")
    private int maxLoginAttempts;

    @Value("${app.security.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    private record LoginAttemptInfo(AtomicInteger attempts, LocalDateTime lockoutUntil) {}
    private final Map<String, LoginAttemptInfo> loginAttempts = new ConcurrentHashMap<>();

    private void checkLoginAttempts(String email) {
        LoginAttemptInfo info = loginAttempts.get(email.toLowerCase());
        if (info != null && info.lockoutUntil() != null && info.lockoutUntil().isAfter(LocalDateTime.now())) {
            log.warn("Account locked due to too many failed login attempts: {}", email);
            throw new HttpClientErrorException(TOO_MANY_REQUESTS, "error.account.temporarily.locked");
        }
    }

    private void recordFailedAttempt(String email) {
        String key = email.toLowerCase();
        LoginAttemptInfo info = loginAttempts.computeIfAbsent(key,
                k -> new LoginAttemptInfo(new AtomicInteger(0), null));
        int attempts = info.attempts().incrementAndGet();
        if (attempts >= maxLoginAttempts) {
            loginAttempts.put(key, new LoginAttemptInfo(
                    info.attempts(), LocalDateTime.now().plusMinutes(lockoutDurationMinutes)));
            log.warn("Account locked after {} failed attempts: {}", attempts, email);
        }
    }

    private void clearLoginAttempts(String email) {
        loginAttempts.remove(email.toLowerCase());
    }

    @Transactional
    public void createLoginLink(String email) {
        log.info("Creating login link for email: {}", email);

        boolean exists = userService.existsByEmail(email);
        if (exists) {
            var authMethods = userService.getUserAuthMethods(email);
            if (Boolean.FALSE.equals(authMethods.getLoginLinkEnabled())) {
                throw new HttpClientErrorException(BAD_REQUEST, "error.login.link.auth.disabled");
            }
        } else {
            throw new HttpClientErrorException(NOT_FOUND, "error.user.not.found");
        }

        loginLinkRepository.deleteByEmail(email);

        String token = generateUniqueToken();
        LoginLink loginLink = new LoginLink();
        loginLink.setEmail(email);
        loginLink.setToken(token);
        loginLink.setExpiresAt(LocalDateTime.now().plusMinutes(loginLinkExpirationMinutes));

        loginLinkRepository.save(loginLink);
        emailService.sendLoginLink(email, token);

        log.info("Login link created and email sent for email: {}", email);
    }

    @Transactional
    public AuthMultiResponse exchangeLoginLink(UUID organizationId, String token, String twoFactorAuthCode) {
        log.info("Exchanging login link token");

        Optional<LoginLink> loginLinkOpt = loginLinkRepository.findByToken(token);
        if (loginLinkOpt.isEmpty()) {
            throw new HttpClientErrorException(NOT_FOUND, "error.login.link.not.found");
        }

        LoginLink loginLink = loginLinkOpt.get();
        if (loginLink.getExpiresAt().isBefore(LocalDateTime.now())) {
            loginLinkRepository.delete(loginLink);
            throw new HttpClientErrorException(NOT_FOUND, "error.login.link.not.found");
        }

        var authMethods = userService.getUserAuthMethods(loginLink.getEmail());
        if (Boolean.FALSE.equals(authMethods.getLoginLinkEnabled())) {
            loginLinkRepository.delete(loginLink);
            throw new HttpClientErrorException(BAD_REQUEST, "error.login.link.auth.disabled");
        }

        if (twoFactorService.isTwoFactorEnabled(loginLink.getEmail())) {
            if (StringUtils.isBlank(twoFactorAuthCode)) {
                throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.code.required");
            }
            UserDetails userDetails = userDetailsRepository.findByEmail(loginLink.getEmail())
                    .orElseThrow(() -> new HttpClientErrorException(NOT_FOUND, "error.user.not.found"));
            if (!twoFactorService.verifyCode(userDetails.getTwoFactorAuthSecret(), twoFactorAuthCode)) {
                throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.invalid.verification.code");
            }
        }

        User user = userService.getUserByEmail(loginLink.getEmail());

        if (organizationId == null && userService.isMultiOrganizationUser(loginLink.getEmail())) {
            return buildAvailableOrganizationsResponse(user);
        }

        UUID resolvedOrgId = resolveOrganizationId(user, organizationId);

        String accessToken = jwtUtil.generateAccessToken(resolvedOrgId, user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(resolvedOrgId, user.getId(), user.getEmail());

        loginLinkRepository.delete(loginLink);

        log.info("Login link exchanged successfully: {}", loginLink.getEmail());
        return buildAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.refresh.token.invalid");
        }

        if (!"refresh".equals(jwtUtil.getTokenType(refreshToken))) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.refresh.token.not.refresh");
        }

        UUID organizationId = jwtUtil.getOrganizationIdFromToken(refreshToken);
        String email = jwtUtil.getEmailFromToken(refreshToken);
        User user = userService.getUserByEmail(email);

        String newAccessToken = jwtUtil.generateAccessToken(organizationId, user.getId(), user.getEmail());
        String newRefreshToken = jwtUtil.generateRefreshToken(organizationId, user.getId(), user.getEmail());

        return buildAuthResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String email) {
        log.info("Authenticating user with Google: {}", email);

        User user = userService.findUserByEmail(email)
                .orElseThrow(() -> new HttpClientErrorException(NOT_FOUND, "error.user.not.found"));

        UUID organizationId = getFirstOrganizationId(user);

        String accessToken = jwtUtil.generateAccessToken(organizationId, user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(organizationId, user.getId(), user.getEmail());

        log.info("Google user authenticated successfully: {}", email);
        return buildAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthMultiResponse loginUser(LoginRequest request) {
        log.info("Authenticating user with email: {}", request.getEmail());

        checkLoginAttempts(request.getEmail());

        UserDetails userDetails = userDetailsRepository.findByEmailWithPassword(request.getEmail())
                .orElseThrow(() -> {
                    recordFailedAttempt(request.getEmail());
                    return new HttpClientErrorException(NOT_FOUND, "error.user.not.found");
                });

        var authMethods = userService.getUserAuthMethods(request.getEmail());
        if (Boolean.FALSE.equals(authMethods.getPasswordEnabled())) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.password.auth.disabled");
        }

        Optional<String> userPassword = Optional.ofNullable(userDetails.getPassword());
        if (userPassword.isEmpty() || !passwordEncoder.matches(request.getPassword(), userPassword.get())) {
            recordFailedAttempt(request.getEmail());
            throw new HttpClientErrorException(BAD_REQUEST, "error.credentials.invalid");
        }

        if (twoFactorService.isTwoFactorEnabled(request.getEmail())) {
            if (StringUtils.isBlank(request.getTwoFactorAuthCode())) {
                throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.code.required");
            }
            if (!twoFactorService.verifyCode(userDetails.getTwoFactorAuthSecret(), request.getTwoFactorAuthCode())) {
                recordFailedAttempt(request.getEmail());
                throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.invalid.verification.code");
            }
        }

        clearLoginAttempts(request.getEmail());
        User user = userService.getUserByEmail(request.getEmail());

        if (request.getOrganizationId() == null && userService.isMultiOrganizationUser(request.getEmail())) {
            return buildAvailableOrganizationsResponse(user);
        }

        UUID resolvedOrgId = resolveOrganizationId(user, request.getOrganizationId());

        String accessToken = jwtUtil.generateAccessToken(resolvedOrgId, user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(resolvedOrgId, user.getId(), user.getEmail());

        log.info("User authenticated successfully: {}", request.getEmail());
        return buildAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public void forgotPassword(String email) {
        log.info("Processing forgot password request for email: {}", email);

        boolean exists = userService.existsByEmail(email);
        if (!exists) {
            log.info("Forgot password requested for non-existent email: {}", email);
            return;
        }

        passwordResetTokenRepository.deleteByEmail(email);

        String token = generateUniqueToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setEmail(email);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(passwordResetExpirationHours));
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordReset(email, token, passwordResetExpirationHours);

        log.info("Password reset email sent to: {}", email);
    }

    @Transactional
    public ResetPasswordMultiResponse resetPassword(ResetPasswordRequest request) {
        log.info("Resetting password with token");

        Optional<PasswordResetToken> resetTokenOpt = passwordResetTokenRepository.findByToken(request.getToken());
        if (resetTokenOpt.isEmpty()) {
            throw new HttpClientErrorException(NOT_FOUND, "error.reset.token.not.found");
        }

        PasswordResetToken resetToken = resetTokenOpt.get();
        if (resetToken.getUsed()) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.token.already.used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.token.expired");
        }

        userService.setUserPassword(resetToken.getEmail(), passwordEncoder.encode(request.getNewPassword()));

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for: {}", resetToken.getEmail());
        return new ResetPasswordResponse().success(Boolean.TRUE);
    }

    public AuthResponse switchOrganization(SwitchOrganizationRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        String email = SecurityUtils.getCurrentUserEmail();

        User user = userService.getUserByEmail(email);

        organizationMemberRepository.findByOrganizationIdAndUserIdAndIsActiveTrue(request.getOrganizationId(), user.getId())
                .orElseThrow(() -> new HttpClientErrorException(BAD_REQUEST, "error.user.not.member.of.organization"));

        String accessToken = jwtUtil.generateAccessToken(request.getOrganizationId(), user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(request.getOrganizationId(), user.getId(), user.getEmail());

        return buildAuthResponse(accessToken, refreshToken);
    }

    private UUID resolveOrganizationId(User user, UUID requestedOrgId) {
        if (requestedOrgId != null) {
            organizationMemberRepository.findByOrganizationIdAndUserIdAndIsActiveTrue(requestedOrgId, user.getId())
                    .orElseThrow(() -> new HttpClientErrorException(BAD_REQUEST, "error.user.not.member.of.organization"));
            return requestedOrgId;
        }
        return getFirstOrganizationId(user);
    }

    private UUID getFirstOrganizationId(User user) {
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserIdAndIsActiveTrue(user.getId());
        if (memberships.isEmpty()) {
            return null;
        }
        return memberships.get(0).getOrganization().getId();
    }

    private AuthMultiResponse buildAvailableOrganizationsResponse(User user) {
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserIdAndIsActiveTrue(user.getId());
        AvailableOrganizationsResponse response = new AvailableOrganizationsResponse();
        response.setOrganizations(memberships.stream()
                .map(m -> {
                    AvailableOrganizationResponse org = new AvailableOrganizationResponse();
                    org.setId(m.getOrganization().getId());
                    org.setName(m.getOrganization().getName());
                    return org;
                })
                .toList());
        return response;
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken) {
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        return response;
    }

    private String generateUniqueToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
