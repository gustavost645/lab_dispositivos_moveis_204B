package br.com.algsoftwares.utils;

import org.springframework.http.HttpStatusCode;

public class ErrorResponse {

    private int statusCode;
    private String errorMessage;
    private String details;

    public ErrorResponse(HttpStatusCode statusCode, String errorMessage) {
        this.statusCode = statusCode.value();
        this.errorMessage = errorMessage;
    }

    public ErrorResponse(HttpStatusCode statusCode, String errorMessage, String details) {
        this.statusCode = statusCode.value();
        this.errorMessage = errorMessage;
        this.details = details;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
