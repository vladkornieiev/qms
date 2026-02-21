package com.kfdlabs.asap.util;

public class StringUtils {
    private static final String ZERO_WIDTH_REGEX = "[\\uFEFF\\u200B\\u200C\\u200D\\u2060]";

    public static String normalize(String str) {
        if (str == null) {
            return str;
        }
        return str.replaceAll(ZERO_WIDTH_REGEX, "");
    }
}

