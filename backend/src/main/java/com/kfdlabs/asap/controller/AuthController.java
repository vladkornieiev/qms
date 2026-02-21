package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.AuthApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class AuthController implements AuthApi {

    private final AuthService authService;

    @Override
    public ResponseEntity<AuthResponse> refreshToken(RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity.ok(authService.refreshToken(refreshTokenRequest.getRefreshToken()));
    }

    @Override
    public ResponseEntity<AuthMultiResponse> exchangeLoginLink(String token, UUID organizationId, String twoFactorAuthCode) {
        return ResponseEntity.ok(authService.exchangeLoginLink(organizationId, token, twoFactorAuthCode));
    }

    @Override
    public ResponseEntity<Void> createLoginLink(LoginLinkRequest loginLinkRequest) {
        authService.createLoginLink(loginLinkRequest.getEmail());
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<AuthMultiResponse> loginUser(LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.loginUser(loginRequest));
    }

    @Override
    public ResponseEntity<Void> forgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        authService.forgotPassword(forgotPasswordRequest.getEmail());
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<ResetPasswordMultiResponse> resetPassword(ResetPasswordRequest resetPasswordRequest) {
        return ResponseEntity.ok(authService.resetPassword(resetPasswordRequest));
    }
}
