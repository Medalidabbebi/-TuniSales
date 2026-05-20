package com.tunisales.gateway.web.rest;

import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/sms")
public class SmsResource {

    @Value("${application.twilio.account-sid:}")
    private String accountSid;

    @Value("${application.twilio.auth-token:}")
    private String authToken;

    @Value("${application.twilio.from-number:}")
    private String fromNumber;

    private final WebClient webClient;

    public SmsResource(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.twilio.com").build();
    }

    public static class SmsRequest {
        public String to;
        public String body;
    }

    @PostMapping("/send")
    public Mono<ResponseEntity<Map<String, Object>>> send(@RequestBody SmsRequest req) {
        if (accountSid == null || accountSid.isBlank()) {
            return Mono.just(ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", "Twilio non configuré sur le serveur.")));
        }

        String credentials = Base64.getEncoder()
            .encodeToString((accountSid + ":" + authToken).getBytes());

        return webClient.post()
            .uri("/2010-04-01/Accounts/{sid}/Messages.json", accountSid)
            .header("Authorization", "Basic " + credentials)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData("To", req.to)
                .with("From", fromNumber)
                .with("Body", req.body))
            .retrieve()
            .bodyToMono(Map.class)
            .map(res -> ResponseEntity.ok(
                Map.<String, Object>of("success", true, "sid", res.getOrDefault("sid", ""))))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(500)
                .body(Map.of("success", false, "error", e.getMessage() != null ? e.getMessage() : "Erreur Twilio"))));
    }
}
