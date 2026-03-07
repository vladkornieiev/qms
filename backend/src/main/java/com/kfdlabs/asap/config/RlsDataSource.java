package com.kfdlabs.asap.config;

import com.kfdlabs.asap.security.AuthenticatedApiKey;
import com.kfdlabs.asap.security.AuthenticatedUser;
import org.springframework.jdbc.datasource.DelegatingDataSource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.UUID;

/**
 * DataSource wrapper that sets the PostgreSQL session variable {@code app.current_org_id}
 * on every connection, enabling Row Level Security (RLS) org isolation.
 *
 * If no authenticated user/org is available (e.g., public endpoints, migrations),
 * the variable is reset to empty so RLS policies deny access to tenant data.
 */
public class RlsDataSource extends DelegatingDataSource {

    public RlsDataSource(DataSource delegate) {
        super(delegate);
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection conn = super.getConnection();
        setOrgId(conn);
        return conn;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection conn = super.getConnection(username, password);
        setOrgId(conn);
        return conn;
    }

    private void setOrgId(Connection conn) throws SQLException {
        UUID orgId = resolveOrgId();
        try (var stmt = conn.createStatement()) {
            if (orgId != null) {
                stmt.execute("SET app.current_org_id = '" + orgId + "'");
            } else {
                stmt.execute("RESET app.current_org_id");
            }
        }
    }

    private UUID resolveOrgId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof AuthenticatedUser user) {
            return user.getOrganizationId();
        } else if (principal instanceof AuthenticatedApiKey apiKey) {
            return apiKey.getOrganizationId();
        }
        return null;
    }
}
