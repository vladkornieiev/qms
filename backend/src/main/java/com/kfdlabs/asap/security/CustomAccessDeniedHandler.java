package com.kfdlabs.asap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfdlabs.asap.dto.Error;
import com.kfdlabs.asap.exception.ExceptionMessageResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;
    private final ExceptionMessageResolver exceptionMessageResolver;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        log.error("403 {}: Forbidden", request.getRequestURI());

        Error error = new Error();
        error.setCode(HttpServletResponse.SC_FORBIDDEN);
        error.setMessage(exceptionMessageResolver.resolveMessage("error.access.forbidden", request));
        error.setTimestamp(LocalDateTime.now());
        error.setPath(request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String errorJson = objectMapper.writeValueAsString(error);
        response.getWriter().write(errorJson);
        response.getWriter().flush();
    }
} 