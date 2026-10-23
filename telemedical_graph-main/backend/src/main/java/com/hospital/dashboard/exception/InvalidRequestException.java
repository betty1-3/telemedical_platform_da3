package com.hospital.dashboard.exception;

/** Thrown when incoming request data fails basic application-level validation. Mapped to HTTP 400. */
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
