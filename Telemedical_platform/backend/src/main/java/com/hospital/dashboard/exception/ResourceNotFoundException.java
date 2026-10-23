package com.hospital.dashboard.exception;

/** Thrown when a requested row (by id) does not exist. Mapped to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
