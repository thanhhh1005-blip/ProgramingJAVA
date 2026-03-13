package com.company.employee;

public class MailService implements MailSender {
    private final LoggerPort logger;

    public MailService(LoggerPort logger) {
        this.logger = logger;
    }

    @Override
    public void send(String to, String message) {
        logger.log("Start sending mail to " + to);
        System.out.println("Sending mail to " + to);
        System.out.println(message);
    }
}
