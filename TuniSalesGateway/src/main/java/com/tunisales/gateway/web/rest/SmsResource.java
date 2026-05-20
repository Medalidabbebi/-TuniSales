package com.tunisales.gateway.web.rest;

import com.tunisales.gateway.config.ApplicationProperties;
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

    private final ApplicationProperties.Twilio props;
    private final WebClient webClient;

    public SmsResource(ApplicationProperties appProps, WebClient.Builder builder) {
        this.props = appProps.getTwilio();
        this.webClient = builder.baseUrl("https://rest.nexmo.com").build();
    }

    public static class SmsRequest {
        public String to;
        public String body;
    }

    @PostMapping("/send")
    public Mono<ResponseEntity<Map<String, Object>>> send(@RequestBody SmsRequest req) {
        String apiKey = props.getAccountSid();
        String apiSecret = props.getAuthToken();

        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("VOTRE")) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", "SMS non configuré sur le serveur.");
            return Mono.just(ResponseEntity.badRequest().body(err));
        }

        // Normalise le numéro : retire le + et les espaces
        String to = req.to.replaceAll("[\\s+\\-()]", "");

        return webClient.post()
            .uri("/sms/json")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData("api_key", apiKey)
                .with("api_secret", apiSecret)
                .with("to", to)
                .with("from", "TuniSales")
                .with("text", req.body))
            .retrieve()
            .bodyToMono(Map.class)
            .map(res -> {
                Map<String, Object> ok = new HashMap<>();
                try {
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> messages =
                        (java.util.List<Map<String, Object>>) res.get("messages");
                    if (messages != null && !messages.isEmpty()) {
                        String status = (String) messages.get(0).get("status");
                        if ("0".equals(status)) {
                            ok.put("success", true);
                            ok.put("messageId", messages.get(0).get("message-id"));
                        } else {
                            ok.put("success", false);
                            ok.put("error", messages.get(0).getOrDefault("error-text", "Erreur Vonage"));
                        }
                    } else {
                        ok.put("success", false);
                        ok.put("error", "Réponse Vonage invalide");
                    }
                } catch (Exception e) {
                    ok.put("success", false);
                    ok.put("error", "Erreur de parsing");
                }
                return ResponseEntity.ok(ok);
            })
            .onErrorResume(e -> {
                Map<String, Object> errMap = new HashMap<>();
                errMap.put("success", false);
                errMap.put("error", e.getMessage() != null ? e.getMessage() : "Erreur réseau");
                return Mono.just(ResponseEntity.status(500).body(errMap));
            });
    }
}
