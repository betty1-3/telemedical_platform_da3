package com.hospital.dashboard.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.SQLException;

/**
 * Centralised error handling.
 *
 * The database (Oracle) already enforces primary keys, foreign keys, unique
 * constraints and CHECK constraints. We do NOT try to re-implement all of
 * that here - instead we catch the resulting Spring DataAccessException,
 * look at the underlying Oracle error code, and translate it into a clean
 * HTTP response instead of leaking a raw stack trace to the frontend.
 *
 * Common Oracle error codes handled:
 *   ORA-00001 - unique constraint violated              -> 409 Conflict
 *   ORA-01400 - cannot insert NULL                       -> 400 Bad Request
 *   ORA-02290 - check constraint violated                -> 400 Bad Request
 *   ORA-02291 - parent key not found (bad foreign key)    -> 400 Bad Request
 *   ORA-02292 - child record exists (blocked delete)      -> 409 Conflict
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiError> handleInvalid(InvalidRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleBeanValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .orElse("Invalid request body");
        return build(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Database constraint violation", ex);
        SQLException sqlEx = extractSqlException(ex);
        if (sqlEx != null) {
            int code = sqlEx.getErrorCode();
            switch (code) {
                case 1: // ORA-00001 unique constraint violated
                    return build(HttpStatus.CONFLICT, "A record with this unique value already exists.");
                case 2291: // ORA-02291 parent key not found
                    return build(HttpStatus.BAD_REQUEST, "Referenced record does not exist (invalid foreign key).");
                case 2292: // ORA-02292 child record found
                    return build(HttpStatus.CONFLICT, "Cannot delete this record because dependent records exist.");
                case 2290: // ORA-02290 check constraint violated
                    return build(HttpStatus.BAD_REQUEST, "Value violates a database check constraint.");
                case 1400: // ORA-01400 cannot insert NULL
                    return build(HttpStatus.BAD_REQUEST, "A required field is missing (NULL not allowed).");
                default:
                    return build(HttpStatus.BAD_REQUEST, "Database rejected the request (constraint violation).");
            }
        }
        return build(HttpStatus.BAD_REQUEST, "Database rejected the request (constraint violation).");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex) {
        log.error("Database access failure", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected database error. Please try again later.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        log.error("Unhandled server error", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error. Please try again later.");
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), status.getReasonPhrase(), message));
    }

    /** Walks the cause chain to find the underlying java.sql.SQLException, if any. */
    private SQLException extractSqlException(Throwable ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof SQLException) {
                return (SQLException) cause;
            }
            cause = cause.getCause();
        }
        return null;
    }
}
