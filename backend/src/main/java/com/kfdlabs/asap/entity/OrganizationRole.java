package com.kfdlabs.asap.entity;

public enum OrganizationRole {
    PLATFORM_ADMIN,
    OWNER,
    ADMIN,
    MEMBER,
    VIEWER,
    ACCOUNTANT;

    public static OrganizationRole fromString(String value) {
        return OrganizationRole.valueOf(value.toUpperCase());
    }
}
