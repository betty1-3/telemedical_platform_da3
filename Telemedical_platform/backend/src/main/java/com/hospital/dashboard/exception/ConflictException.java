package com.hospital.dashboard.exception;

/**
 * Thrown for constraint conflicts we detect ourselves before hitting the DB
 * (rare - most conflicts are caught from Oracle's own constraint violations
 * in GlobalExceptionHandler). Mapped to HTTP 409.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
