package com.tunisales.gateway.web.rest;

import com.tunisales.gateway.config.ApplicationProperties;
import java.util.Base64;
import java.util.HashMap;
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
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", "Twilio non configuré sur le serveur.");
            return Mono.just(ResponseEntity.badRequest().body(err));
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
            .map(res -> {
                Map<String, Object> ok = new HashMap<>();
                ok.put("success", true);
                ok.put("sid", res.getOrDefault("sid", ""));
                return ResponseEntity.ok(ok);
            })
            .onErrorResume(e -> {
                Map<String, Object> errMap = new HashMap<>();
                errMap.put("success", false);
                errMap.put("error", e.getMessage() != null ? e.getMessage() : "Erreur Twilio");
                return Mono.just(ResponseEntity.status(500).body(errMap));
            });
    }
}
