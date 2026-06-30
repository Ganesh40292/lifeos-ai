package com.lifeos.util;

/**
 * Application-wide constants.
 */
public final class AppConstants {

    private AppConstants() {
        // Utility class — prevent instantiation
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIR = "desc";
    public static final int MAX_PAGE_SIZE = 50;
}
