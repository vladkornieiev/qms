package com.kfdlabs.asap.exception;

import com.kfdlabs.asap.dto.Error;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.LocaleResolver;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExceptionMessageResolver {

    private final MessageSource messageSource;
    private final LocaleResolver localeResolver;

    public String resolveMessage(String messageOrKey, HttpServletRequest request) {
        return resolveMessage(messageOrKey, localeResolver.resolveLocale(request));
    }

    public ResponseEntity<Error> buildErrorResponse(HttpStatus status, String messageOrKey, HttpServletRequest request, Exception e) {
        Locale locale = localeResolver.resolveLocale(request);
        String localizedMessage = resolveMessage(messageOrKey, locale);

        Error error = new Error();
        error.setCode(status.value());
        error.setMessage(localizedMessage);
        error.setTimestamp(LocalDateTime.now());
        error.setPath(request.getRequestURI());

        log.error("{} {}: {}", status.value(), request.getRequestURI(), resolveMessage(messageOrKey, Locale.ENGLISH), e);

        return ResponseEntity.status(status).body(error);
    }

    private String resolveMessage(String messageOrKey, Locale locale) {
        try {
            // Check if message contains parameters (format: key|param1|param2...)
            String[] parts = messageOrKey.split("\\|");
            String key = parts[0];
            Object[] args = null;

            if (parts.length > 1) {
                args = new Object[parts.length - 1];
                System.arraycopy(parts, 1, args, 0, parts.length - 1);
            }

            return messageSource.getMessage(key, args, messageOrKey, locale);
        } catch (Exception e) {
            return messageOrKey;
        }
    }
}
