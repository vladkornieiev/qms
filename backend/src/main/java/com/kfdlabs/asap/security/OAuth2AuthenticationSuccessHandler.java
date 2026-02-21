package com.kfdlabs.asap.security;

import com.kfdlabs.asap.dto.AuthResponse;
import com.kfdlabs.asap.service.AuthService;
import com.kfdlabs.asap.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    @Lazy
    private AuthService authService;
    private final UserService userService;

    @Value("${app.security.oauth.success-callback-url}")
    private String successCallbackUrl;
    @Value("${app.security.oauth.failure-callback-url}")
    private String failureCallbackUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        log.info("OAuth2 login successful for email: {}", email);

        try {
            // Pre-authenticate to ensure user exists (creates if needed via Google flow)
            authService.authenticateWithGoogle(email);

            // Generate a short-lived, single-use OAuth exchange code instead of passing tokens in URL
            String code = authService.createOAuthExchangeCode(email);
            boolean isMultiOrgUser = userService.isMultiOrganizationUser(email);

            String redirectUrl = getRedirectUrl(code, isMultiOrgUser);

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            log.error("Error during OAuth2 authentication", e);
            String errorRedirectUrl = String.format("%s?error=%s", failureCallbackUrl, "authentication_failed");
            try {
                getRedirectStrategy().sendRedirect(request, response, errorRedirectUrl);
            } catch (IOException ex) {
                log.error("Error redirecting to error page", ex);
            }
        }
    }

    private String getRedirectUrl(String code, boolean isMultiOrgUser) {
        StringBuilder redirectUrl = new StringBuilder(successCallbackUrl);
        redirectUrl.append("?code=").append(code);
        if (isMultiOrgUser) {
            redirectUrl.append("&isMultiOrgUser=true");
        }
        return redirectUrl.toString();
    }
}
