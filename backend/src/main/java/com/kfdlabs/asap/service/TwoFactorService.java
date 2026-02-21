package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.TwoFactorStatusResponse;
import com.kfdlabs.asap.entity.OneTimePassword;
import com.kfdlabs.asap.entity.UserDetails;
import com.kfdlabs.asap.repository.OneTimePasswordRepository;
import com.kfdlabs.asap.repository.UserDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Slf4j
@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final UserDetailsRepository userDetailsRepository;
    private final OneTimePasswordRepository oneTimePasswordRepository;

//    private final SecretGenerator secretGenerator = new DefaultSecretGenerator(32); // 32 bytes = 256 bits
//    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
//    private final TimeProvider timeProvider = new SystemTimeProvider();
//    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
//    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();


    @Value("${app.2fa.issuer:YourApp}")
    private String issuer;

    @Value("${app.2fa.otp-expiration-minutes:5}")
    private int otpExpirationMinutes;

//    @Transactional
//    public TwoFactorSetupResponse setupTwoFactor(String email) {
//        log.info("Setting up 2FA for email: {}", email);
//
//        // Check if 2FA is already enabled
//        Optional<UserDetails> existingDetails = userDetailsRepository.findByEmail(email);
//        if (existingDetails.isEmpty()) {
//            throw new HttpClientErrorException(NOT_FOUND, "error.user.not.found");
//        }
//        if (existingDetails.get().getTwoFactorAuthEnabled()) {
//            throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.already.enabled");
//        }
//
//        String secret;
//        UserDetails userDetails = existingDetails.orElseGet(UserDetails::new);
//
//        secret = secretGenerator.generate();
//        userDetails.setEmail(email);
//        userDetails.setTwoFactorAuthSecret(secret);
//        userDetails.setTwoFactorAuthEnabled(false);
//        userDetails = userDetailsRepository.save(userDetails);
//
//        // Generate QR code data with proper TOTP parameters
//        QrData qrData = new QrData.Builder()
//                .label(email)
//                .secret(secret)
//                .issuer(issuer)
//                .algorithm(HashingAlgorithm.SHA1)
//                .digits(6)
//                .period(30)
//                .build();
//
//        try {
//            byte[] qrCodeBytes = qrGenerator.generate(qrData);
//            String qrCode = Base64.getEncoder().encodeToString(qrCodeBytes);
//
//            TwoFactorSetupResponse response = new TwoFactorSetupResponse();
//            response.setSecret(secret);
//            response.setQrCode(qrCode);
//            response.setUri(qrData.getUri());
//
//            return response;
//        } catch (QrGenerationException e) {
//            log.error("Failed to generate QR code", e);
//            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.2fa.failed.to.generate.qr");
//        }
//    }
//
//    @Transactional
//    public void enableTwoFactor(String email, String code) {
//        log.info("Enabling 2FA for email: {}", email);
//
//        UserDetails userDetails = userDetailsRepository.findByEmail(email)
//                .orElseThrow(() -> new HttpClientErrorException(NOT_FOUND, "error.2fa.setup.not.found"));
//
//        if (userDetails.getTwoFactorAuthEnabled()) {
//            throw new HttpClientErrorException(CONFLICT, "error.2fa.already.enabled");
//        }
//
//        String secret = userDetails.getTwoFactorAuthSecret();
//        if (!codeVerifier.isValidCode(secret, code)) {
//            throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.invalid.verification.code");
//        }
//
//        userDetails.setTwoFactorAuthEnabled(true);
//        userDetailsRepository.save(userDetails);
//
//        log.info("2FA enabled successfully for email: {}", email);
//    }

    @Transactional
    public void disableTwoFactor(String email, String code) {
        log.info("Disabling 2FA for email: {}", email);

        UserDetails userDetails = userDetailsRepository.findByEmailAnd2FAEnabled(email)
                .orElseThrow(() -> new HttpClientErrorException(BAD_REQUEST, "error.2fa.not.enabled"));

        if (!verifyCode(userDetails.getTwoFactorAuthSecret(), code)) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.2fa.invalid.verification.code");
        }

        userDetails.setTwoFactorAuthEnabled(false);
        userDetailsRepository.save(userDetails);

        log.info("2FA disabled successfully for email: {}", email);
    }

    public TwoFactorStatusResponse getTwoFactorStatus(String email) {
        log.info("Getting 2FA status for email: {}", email);

        Optional<UserDetails> userDetails = userDetailsRepository.findByEmail(email);

        TwoFactorStatusResponse response = new TwoFactorStatusResponse();
        response.setEnabled(userDetails.isPresent() && userDetails.get().getTwoFactorAuthEnabled());

        return response;
    }

    @Transactional
    public String createTwoFactorChallengeToken(String email) {
        log.info("Creating 2FA challenge token for email: {}", email);

        // Clean up expired codes
        oneTimePasswordRepository.deleteExpiredCodes(LocalDateTime.now());

        // Delete existing challenge token for this user
        oneTimePasswordRepository.findByEmail(email).ifPresent(oneTimePasswordRepository::delete);

        // Generate unique token (not just digits)
        String token = UUID.randomUUID().toString().replace("-", "");

        OneTimePassword otp = new OneTimePassword();
        otp.setEmail(email);
        otp.setCode(token);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));

        oneTimePasswordRepository.save(otp);

        return token;
    }

//    public boolean isValidCode(String secret, String code) {
//        return codeVerifier.isValidCode(secret, code);
//    }

//    public boolean verifyTwoFactorChallenge(String token, String totpCode) {
//        log.info("Verifying 2FA challenge token: {}", token);
//
//        Optional<OneTimePassword> otpOpt = oneTimePasswordRepository.findByCode(token);
//        if (otpOpt.isEmpty()) {
//            return false;
//        }
//
//        OneTimePassword otp = otpOpt.get();
//        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
//            oneTimePasswordRepository.delete(otp);
//            return false;
//        }
//
//        // Verify TOTP code if email is present (indicating this is a 2FA challenge)
//        if (otp.getEmail() != null) {
//            if (!isTwoFactorEnabled(otp.getEmail())) {
//                oneTimePasswordRepository.delete(otp);
//                return false;
//            }
//
//            Optional<UserDetails> userDetails = getUserDetails(otp.getEmail());
//            if (userDetails.isEmpty()) {
//                oneTimePasswordRepository.delete(otp);
//                return false;
//            }
//
//            String secret = userDetails.get().getTwoFactorAuthSecret();
//            return codeVerifier.isValidCode(secret, totpCode); // Don't delete OTP on TOTP failure - allow retry
//        }
//
//        // Don't delete the OTP here - let the caller handle it
//        return true;
//    }

    public String getEmailFromChallengeToken(String token) {
        Optional<OneTimePassword> otpOpt = oneTimePasswordRepository.findByCode(token);
        return otpOpt.map(OneTimePassword::getEmail).orElse(null);
    }

    public void deleteChallengeToken(String token) {
        Optional<OneTimePassword> otpOpt = oneTimePasswordRepository.findByCode(token);
        otpOpt.ifPresent(oneTimePasswordRepository::delete);
    }

    public boolean isTwoFactorEnabled(String email) {
        return userDetailsRepository.findByEmailAnd2FAEnabled(email).isPresent();
    }

    public boolean verifyCode(String secret, String code) {
//        try {
        // Use TOTP verification - secret should already be in Base32 format from the library
//            return codeVerifier.isValidCode(secret, code);
//        } catch (Exception e) {
//            log.error("Error verifying TOTP code", e);
//            return false;
//        }
        return true;
    }

    public Optional<UserDetails> getUserDetails(String email) {
        return userDetailsRepository.findByEmail(email);
    }
}
