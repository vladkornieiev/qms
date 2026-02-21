package com.kfdlabs.asap.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfdlabs.asap.dto.Error;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.BucketProxy;
import io.github.bucket4j.postgresql.Bucket4jPostgreSQL;
import io.github.bucket4j.postgresql.PostgreSQLadvisoryLockBasedProxyManager;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static java.time.Duration.ofSeconds;

@Configuration
@Slf4j
public class RateLimitConfig {

    @Autowired
    private DataSource dataSource;

    // as RPS is refilled once a second, its okay to delete everything once in a while
    @Scheduled(fixedRate = 1000 * 60 * 60)
    public void clearBuckets() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("DELETE FROM bucket");
        } catch (Exception e) {
            log.error("Failed to clear buckets", e);
        }
    }

    @Bean
    public PostgreSQLadvisoryLockBasedProxyManager<Long> lockProxyManager() {
        return Bucket4jPostgreSQL
                .advisoryLockBasedBuilder(dataSource)
                .table("bucket")
                .build();
    }

    @Bean
    @ConditionalOnProperty(value = "app.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
    public FilterRegistrationBean<RateLimitFilter> loggingFilter(ObjectMapper objectMapper,
                                                                 @Value("${app.rate-limit.rps}") int rps) {
        FilterRegistrationBean<RateLimitFilter> registrationBean = new FilterRegistrationBean<>();

        registrationBean.setFilter(new RateLimitFilter(rps, objectMapper, lockProxyManager()));
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return registrationBean;
    }

    public static class RateLimitFilter implements Filter {

        private final Map<Long, Bucket> bucketsByIpAddress;
        private final int rps;
        private final ObjectMapper objectMapper;
        private final PostgreSQLadvisoryLockBasedProxyManager<Long> proxyManager;

        public RateLimitFilter(int rps, ObjectMapper objectMapper, PostgreSQLadvisoryLockBasedProxyManager<Long> proxyManager) {
            this.bucketsByIpAddress = new ConcurrentHashMap<>();
            this.rps = rps;
            this.objectMapper = objectMapper;
            this.proxyManager = proxyManager;
        }

        private BucketProxy newBucket(Long key) {
            return proxyManager.getProxy(key, () -> BucketConfiguration.builder()
                    .addLimit(Bandwidth.builder().capacity(rps)
                            .refillIntervally(rps, ofSeconds(1))
                            .build())
                    .build());
        }

        @SneakyThrows
        private long ipToLong(String ipAddress) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8));
            ByteBuffer buffer = ByteBuffer.wrap(hash);
            return buffer.getLong();
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            String ipAddress = request.getRemoteAddr();
            boolean success = bucketsByIpAddress.computeIfAbsent(ipToLong(ipAddress), this::newBucket)
                    .tryConsume(1);
            if (success) {
                chain.doFilter(request, response);
                return;
            }

            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setHeader("Content-Type", "application/json");
            Error error = new Error()
                    .code(HttpStatus.TOO_MANY_REQUESTS.value())
                    .message("Rate limit exceeded. Please try again later.")
                    .path(((HttpServletRequest) request).getRequestURI())
                    .timestamp(LocalDateTime.now());
            httpResponse.getWriter().write(objectMapper.writeValueAsString(error));
        }
    }
}
