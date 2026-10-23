package com.hospital.dashboard.exception;

/** Raised when graph endpoints cannot use their separately configured Neo4j database. */
public class GraphUnavailableException extends RuntimeException {
    public GraphUnavailableException(String message) {
        super(message);
    }

    public GraphUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
