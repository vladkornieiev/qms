package com.kfdlabs.asap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfdlabs.asap.dto.Error;
import com.kfdlabs.asap.exception.ExceptionMessageResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;
    private final ExceptionMessageResolver exceptionMessageResolver;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.error("401 {}: Unauthorized", request.getRequestURI());

        Error error = new Error();
        error.setCode(HttpServletResponse.SC_UNAUTHORIZED);
        error.setMessage(exceptionMessageResolver.resolveMessage("error.access.unauthorized", request));
        error.setTimestamp(LocalDateTime.now());
        error.setPath(request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String errorJson = objectMapper.writeValueAsString(error);
        response.getWriter().write(errorJson);
        response.getWriter().flush();
    }
} 