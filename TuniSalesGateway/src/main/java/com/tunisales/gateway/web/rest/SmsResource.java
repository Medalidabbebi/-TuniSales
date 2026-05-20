package com.tunisales.gateway.web.rest;

import com.tunisales.gateway.config.ApplicationProperties;
import java.util.Base64;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/sms")
public class SmsResource {

    private final ApplicationProperties.Twilio twilioProps;
    private final WebClient webClient;

    public SmsResource(ApplicationProperties appProps, WebClient.Builder builder) {
        this.twilioProps = appProps.getTwilio();
        this.webClient = builder.baseUrl("https://api.twilio.com").build();
    }

    public static class SmsRequest {
        public String to;
        public String body;
    }

    @PostMapping("/send")
    public Mono<ResponseEntity<Map<String, Object>>> send(@RequestBody SmsRequest req) {
        String sid = twilioProps.getAccountSid();
        if (sid == null || sid.isBlank()) {
            return Mono.just(ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", "Twilio non configuré sur le serveur.")));
        }

        String credentials = Base64.getEncoder()
            .encodeToString((sid + ":" + twilioProps.getAuthToken()).getBytes());

        return webClient.post()
            .uri("/2010-04-01/Accounts/{sid}/Messages.json", sid)
            .header("Authorization", "Basic " + credentials)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData("To", req.to)
                .with("From", twilioProps.getFromNumber())
                .with("Body", req.body))
            .retrieve()
            .bodyToMono(Map.class)
            .map(res -> ResponseEntity.ok(
                Map.<String, Object>of("success", true, "sid", res.getOrDefault("sid", ""))))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(500)
                .body(Map.of("success", false, "error", e.getMessage() != null ? e.getMessage() : "Erreur Twilio"))));
    }
}
