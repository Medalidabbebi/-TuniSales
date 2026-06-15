package com.tunisales.gateway.web.rest;

import java.util.HashMap;
import java.util.Map;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/email")
public class EmailResource {

    private final JavaMailSender mailSender;

    public EmailResource(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public static class EmailRequest {
        public String to;
        public String subject;
        public String body;
    }

    @PostMapping("/send")
    public Mono<ResponseEntity<Map<String, Object>>> send(@RequestBody EmailRequest req) {
        Map<String, Object> result = new HashMap<>();
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(req.to);
            helper.setSubject(req.subject != null ? req.subject : "Message TuniSales");
            helper.setText(req.body, false);
            mailSender.send(message);
            result.put("success", true);
            return Mono.just(ResponseEntity.ok(result));
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage() != null ? e.getMessage() : "Erreur d'envoi email");
            return Mono.just(ResponseEntity.status(500).body(result));
        }
    }
}
