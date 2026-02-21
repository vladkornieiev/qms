package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.UserEmailPreferences;
import com.kfdlabs.asap.repository.UserEmailPreferencesRepository;
import com.kfdlabs.asap.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;

import static com.kfdlabs.asap.security.SecurityUtils.getCurrentUserEmail;
import static org.springframework.http.HttpStatus.BAD_REQUEST;


@Slf4j
@Service
@RequiredArgsConstructor
public class UserEmailPreferencesService {

    private final UserEmailPreferencesRepository repository;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public UserEmailPreferences getCurrentUserPreferences() {
        return repository.findByEmail(getCurrentUserEmail()).orElseGet(() -> createDefault(getCurrentUserEmail()));
    }

    @Transactional
    public UserEmailPreferences updateCurrentUserPreferences(Map<String, Object> preferences) {
        UserEmailPreferences prefs = repository.findByEmail(getCurrentUserEmail()).orElseGet(() -> createDefault(getCurrentUserEmail()));
        prefs.setPreferences(preferences);
        return repository.save(prefs);
    }

    @Transactional
    public UserEmailPreferences updatePreferencesForUser(String email, Map<String, Object> preferences) {
        UserEmailPreferences prefs = repository.findByEmail(email).orElseGet(() -> createDefault(email));
        prefs.setPreferences(preferences);
        return repository.save(prefs);
    }

    public String validateAndExtractEmailFromToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.token.invalid");
        }
        String type = jwtUtil.getTokenType(token);
        if (!"preferences".equals(type)) {
            throw new HttpClientErrorException(BAD_REQUEST, "error.token.invalid.type");
        }
        return jwtUtil.getEmailFromToken(token);
    }

    @Transactional(readOnly = true)
    public UserEmailPreferences getPreferencesForUser(String email) {
        return repository.findByEmail(email).orElseGet(() -> createDefault(email));
    }

    private UserEmailPreferences createDefault(String email) {
        UserEmailPreferences prefs = new UserEmailPreferences();
        prefs.setEmail(email);
        return repository.save(prefs);
    }
}


