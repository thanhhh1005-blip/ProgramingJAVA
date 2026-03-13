package com.company.employee;

public class AppLogger implements LoggerPort {
    @Override
    public void log(String message) {
        System.out.println("[LOG] " + message);
    }
}
