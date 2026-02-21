package com.kfdlabs.asap.exception;

import com.kfdlabs.asap.dto.Error;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ExceptionMessageResolver exceptionMessageResolver;

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Error> handleHttpClientErrorException(HttpClientErrorException ex, HttpServletRequest request) {
        return exceptionMessageResolver.buildErrorResponse(HttpStatus.valueOf(ex.getStatusCode().value()), ex.getStatusText(), request, ex);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Error> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        return exceptionMessageResolver.buildErrorResponse(HttpStatus.FORBIDDEN, "error.access.denied", request, ex);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<Error> handleValidationException(Exception ex, HttpServletRequest request) {
        return exceptionMessageResolver.buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request, ex);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Error> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        return exceptionMessageResolver.buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request, ex);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Error> handleSizeLimitExceededException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return exceptionMessageResolver.buildErrorResponse(HttpStatus.PAYLOAD_TOO_LARGE, "error.file.size.exceeded", request, ex);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Error> handleGenericException(Exception ex, HttpServletRequest request) {
        return exceptionMessageResolver.buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "error.internal.server", request, ex);
    }
}