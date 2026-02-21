package com.kfdlabs.asap.security;

import com.kfdlabs.asap.entity.OrganizationMember;
import com.kfdlabs.asap.entity.User;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractTokenFromRequest(request);

        if (token != null && jwtUtil.validateToken(token) && "access".equals(jwtUtil.getTokenType(token))) {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = jwtUtil.getUserIdFromToken(token);
            UUID organizationId = jwtUtil.getOrganizationIdFromToken(token);

            Optional<User> userOptional = userRepository.findByIdAndIsActiveTrue(userId);

            if (SecurityContextHolder.getContext().getAuthentication() == null && userOptional.isPresent()) {
                // Load role from organization_members for the current org
                List<GrantedAuthority> authorities = List.of();
                if (organizationId != null) {
                    Optional<OrganizationMember> memberOpt =
                            organizationMemberRepository.findByOrganizationIdAndUserIdAndIsActiveTrue(organizationId, userId);
                    if (memberOpt.isPresent()) {
                        String role = memberOpt.get().getRole().toUpperCase();
                        authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                    }
                }

                AuthenticatedUser authenticatedUser = new AuthenticatedUser(organizationId, email, userId, authorities);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(authenticatedUser, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
