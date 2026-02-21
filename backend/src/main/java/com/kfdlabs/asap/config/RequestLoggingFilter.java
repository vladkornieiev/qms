package com.kfdlabs.asap.config;

import com.kfdlabs.asap.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jboss.logging.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long before = System.currentTimeMillis();
        long after = before;
        String uri = request.getRequestURI();
        String ip = getClientIp(request);
        String method = request.getMethod();
        MDC.put("request", uri);
        MDC.put("ip", ip);
        MDC.put("method", method);
        Optional<UserInfo> userInfo = getUserInfo(request);
        if (userInfo.isEmpty()) {
            MDC.put("userId", "anonymous");
        } else {
            MDC.put("userId", userInfo.get().userId.toString());
            MDC.put("organizationId", userInfo.get().organizationId != null ? userInfo.get().organizationId.toString() : "none");
            MDC.put("email", userInfo.get().email);
        }

        try {
            filterChain.doFilter(request, response);
            after = System.currentTimeMillis();
        } finally {
            int statusCode = response.getStatus();
            long duration = after - before;
            MDC.put("statusCode", String.valueOf(statusCode));
            MDC.put("duration", String.valueOf(duration));
            if (!method.equalsIgnoreCase("OPTIONS")) {
                if (userInfo.isEmpty()) {
                    log.info("[anonymous {}] {} {}: {} ({}ms)", ip, method, uri, statusCode, duration);
                } else {
                    log.info("[{} {}] {} {}: {} ({}ms)", userInfo.get().email, ip, method, uri, statusCode, duration);
                }
            }
            MDC.clear();
        }
    }

    private Optional<UserInfo> getUserInfo(HttpServletRequest request) {
        try {
            String authorization = request.getHeader("Authorization");
            if (StringUtils.isBlank(authorization)) {
                return Optional.empty();
            }

            if (authorization.startsWith("Bearer ")) {
                authorization = authorization.substring(7);
            }

            return Optional.of(new UserInfo(
                    jwtUtil.getOrganizationIdFromToken(authorization),
                    jwtUtil.getUserIdFromToken(authorization),
                    jwtUtil.getEmailFromToken(authorization)
            ));
        } catch (Exception e) {
            log.debug("Error getting user info from request: {}, authorization header: {}",
                    request.getRequestURI(), request.getHeader("Authorization"), e);
            return Optional.empty();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record UserInfo(UUID organizationId, UUID userId, String email) {
    }
}
