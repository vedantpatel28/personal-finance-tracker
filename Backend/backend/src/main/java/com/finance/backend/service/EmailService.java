package com.finance.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendResetPasswordEmail(String toEmail, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(toEmail);
        message.setSubject("FinanceOS - Password Reset Verification Code");
        message.setText("Hello,\n\n"
                + "You recently requested to reset your password for your FinanceOS account.\n\n"
                + "Your 6-digit verification code is: " + resetToken + "\n\n"
                + "This code will expire in 15 minutes.\n\n"
                + "If you did not request this, please disregard this message.\n\n"
                + "Best regards,\n"
                + "FinanceOS Team");

        mailSender.send(message);
    }
}