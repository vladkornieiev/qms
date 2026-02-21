package com.kfdlabs.asap.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.name}")
    private String appName;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.link-expiration-minutes:15}")
    private int linkExpirationMinutes;

    @Value("${app.base-ui-url}")
    private String baseUrl;

    public void sendLoginLink(String toEmail, String token) {
        try {
            log.info("Sending login link email to: {}", toEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            message.setHeader("Message-ID", "<" + UUID.randomUUID() + "@asap.kfdlabs.com>");
            message.setHeader("X-Entity-Ref-ID", UUID.randomUUID().toString());
            helper.setSubject("Your login link for " + appName);

            String loginUrl = baseUrl + "/auth/exchange?token=" + token;
            String htmlContent = buildLoginEmailContent(toEmail, loginUrl);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Login link email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send login link email to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        } catch (Exception e) {
            log.error("Unexpected error sending email to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        }
    }

    public void sendEmailConfirmation(String toEmail, String token, int expirationHours) {
        try {
            log.info("Sending email confirmation to: {}", toEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Confirm your email for " + appName);

            String confirmationUrl = baseUrl + "/auth/confirm-email?token=" + token;
            String htmlContent = buildConfirmationEmailContent(toEmail, confirmationUrl, expirationHours);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email confirmation sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email confirmation to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        } catch (Exception e) {
            log.error("Unexpected error sending email confirmation to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        }
    }

    public void sendPasswordReset(String toEmail, String token, int expirationHours) {
        try {
            log.info("Sending password reset email to: {}", toEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Reset your password for " + appName);

            String resetUrl = baseUrl + "/auth/reset-password?token=" + token;
            String htmlContent = buildPasswordResetEmailContent(toEmail, resetUrl, expirationHours);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        } catch (Exception e) {
            log.error("Unexpected error sending password reset email to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName, String organizationName) {
        try {
            log.info("Sending welcome email to: {}, organization: {}", userName, organizationName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + appName + "!");

            String htmlContent = buildWelcomeEmailContent(userName, organizationName, baseUrl);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        } catch (Exception e) {
            log.error("Unexpected error sending welcome email to: {}", toEmail, e);
            throw new HttpClientErrorException(INTERNAL_SERVER_ERROR, "error.email.failed.to.send");
        }
    }

    public void sendWorkflowEmail(String toEmail, String subject, String body) {
        try {
            log.info("Sending workflow email to: {}", toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            Context context = new Context(Locale.getDefault());
            context.setVariable("appName", appName);
            context.setVariable("subject", subject);
            context.setVariable("body", body);
            context.setVariable("supportEmail", fromEmail);
            context.setVariable("currentYear", LocalDate.now().getYear());
            String htmlContent = templateEngine.process("workflow-notification", context);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Workflow email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send workflow email to: {}", toEmail, e);
        }
    }

    public void sendInvoiceEmail(String toEmail, String invoiceNumber, String clientName,
                                  String total, String currency, String dueDate, String invoiceUrl) {
        try {
            log.info("Sending invoice email to: {} for invoice {}", toEmail, invoiceNumber);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Invoice " + invoiceNumber + " from " + appName);

            Context context = new Context(Locale.getDefault());
            context.setVariable("appName", appName);
            context.setVariable("invoiceNumber", invoiceNumber);
            context.setVariable("clientName", clientName);
            context.setVariable("total", total);
            context.setVariable("currency", currency);
            context.setVariable("dueDate", dueDate);
            context.setVariable("invoiceUrl", invoiceUrl);
            context.setVariable("supportEmail", fromEmail);
            context.setVariable("currentYear", LocalDate.now().getYear());
            String htmlContent = templateEngine.process("invoice-notification", context);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Invoice email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invoice email to: {}", toEmail, e);
        }
    }

    public void sendQuoteEmail(String toEmail, String quoteNumber, String clientName,
                                String total, String currency, String validUntil, String quoteUrl) {
        try {
            log.info("Sending quote email to: {} for quote {}", toEmail, quoteNumber);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Quote " + quoteNumber + " from " + appName);

            Context context = new Context(Locale.getDefault());
            context.setVariable("appName", appName);
            context.setVariable("quoteNumber", quoteNumber);
            context.setVariable("clientName", clientName);
            context.setVariable("total", total);
            context.setVariable("currency", currency);
            context.setVariable("validUntil", validUntil);
            context.setVariable("quoteUrl", quoteUrl);
            context.setVariable("supportEmail", fromEmail);
            context.setVariable("currentYear", LocalDate.now().getYear());
            String htmlContent = templateEngine.process("quote-notification", context);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Quote email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send quote email to: {}", toEmail, e);
        }
    }

    public void sendPaymentReceiptEmail(String toEmail, String invoiceNumber,
                                         String amount, String currency, String paymentDate) {
        try {
            log.info("Sending payment receipt email to: {} for invoice {}", toEmail, invoiceNumber);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Payment Received - Invoice " + invoiceNumber);

            Context context = new Context(Locale.getDefault());
            context.setVariable("appName", appName);
            context.setVariable("invoiceNumber", invoiceNumber);
            context.setVariable("amount", amount);
            context.setVariable("currency", currency);
            context.setVariable("paymentDate", paymentDate);
            context.setVariable("supportEmail", fromEmail);
            context.setVariable("currentYear", LocalDate.now().getYear());
            String htmlContent = templateEngine.process("payment-receipt", context);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Payment receipt email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send payment receipt email to: {}", toEmail, e);
        }
    }

    public void sendReminderEmail(String toEmail, String subject, String reminderType,
                                   String entityRef, String details, String actionUrl) {
        try {
            log.info("Sending reminder email ({}) to: {}", reminderType, toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            Context context = new Context(Locale.getDefault());
            context.setVariable("appName", appName);
            context.setVariable("reminderType", reminderType);
            context.setVariable("entityRef", entityRef);
            context.setVariable("details", details);
            context.setVariable("actionUrl", actionUrl);
            context.setVariable("supportEmail", fromEmail);
            context.setVariable("currentYear", LocalDate.now().getYear());
            String htmlContent = templateEngine.process("reminder", context);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Reminder email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reminder email to: {}", toEmail, e);
        }
    }

    public void sendContractEmail(String toEmail, String contractTitle, String contractType,
                                   String clientName, String expiresAt, String contractUrl) {
        try {
            log.info("Sending contract email to: {} for contract '{}'", toEmail, contractTitle);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("Contract: " + contractTitle + " from " + appName);

            Context context = new Context(Locale.getDefault());
            context.setVariable("appName", appName);
            context.setVariable("contractTitle", contractTitle);
            context.setVariable("contractType", contractType);
            context.setVariable("clientName", clientName);
            context.setVariable("expiresAt", expiresAt);
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("supportEmail", fromEmail);
            context.setVariable("currentYear", LocalDate.now().getYear());
            String htmlContent = templateEngine.process("contract-notification", context);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Contract email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send contract email to: {}", toEmail, e);
        }
    }

    private String buildLoginEmailContent(String email, String loginUrl) {
        Context context = new Context(Locale.getDefault());
        context.setVariable("email", email);
        context.setVariable("loginUrl", loginUrl);
        context.setVariable("supportEmail", fromEmail);
        context.setVariable("expiration", linkExpirationMinutes);
        context.setVariable("currentYear", LocalDate.now().getYear());

        return templateEngine.process("login-link", context);
    }

    private String buildConfirmationEmailContent(String email, String confirmationUrl, int expirationHours) {
        Context context = new Context(Locale.getDefault());
        context.setVariable("appName", appName);
        context.setVariable("email", email);
        context.setVariable("confirmationUrl", confirmationUrl);
        context.setVariable("supportEmail", fromEmail);
        context.setVariable("expiration", expirationHours);
        context.setVariable("currentYear", LocalDate.now().getYear());

        return templateEngine.process("email-confirmation", context);
    }

    private String buildPasswordResetEmailContent(String email, String resetUrl, int expirationHours) {
        Context context = new Context(Locale.getDefault());
        context.setVariable("appName", appName);
        context.setVariable("email", email);
        context.setVariable("resetUrl", resetUrl);
        context.setVariable("supportEmail", fromEmail);
        context.setVariable("expiration", expirationHours);
        context.setVariable("currentYear", LocalDate.now().getYear());

        return templateEngine.process("password-reset", context);
    }

    private String buildWelcomeEmailContent(String userName, String organizationName, String appUrl) {
        Context context = new Context(Locale.getDefault());
        context.setVariable("appName", appName);
        context.setVariable("userName", userName);
        context.setVariable("organizationName", organizationName);
        context.setVariable("appUrl", appUrl);
        context.setVariable("supportEmail", fromEmail);

        return templateEngine.process("welcome", context);
    }
}
