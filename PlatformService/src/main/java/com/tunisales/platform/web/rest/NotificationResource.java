package com.tunisales.platform.web.rest;

import com.tunisales.platform.repository.NotificationRepository;
import com.tunisales.platform.security.AuthoritiesConstants;
import com.tunisales.platform.security.SecurityUtils;
import com.tunisales.platform.service.NotificationService;
import com.tunisales.platform.service.dto.NotificationDTO;
import com.tunisales.platform.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Notifications.
 *
 * Rules:
 *  GET  /notifications         → authenticated users see only their own notifications
 *  POST /notifications         → internal use only (ROLE_ADMIN_SYSTEME); not called from UI
 *  PUT  /notifications/{id}/read → owner marks as read
 *  DELETE /notifications/{id}  → ROLE_ADMIN_SYSTEME only
 */
@RestController
@RequestMapping("/api")
public class NotificationResource {

    private final Logger log = LoggerFactory.getLogger(NotificationResource.class);

    private static final String ENTITY_NAME = "platformServiceNotification";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final NotificationService notificationService;

    private final NotificationRepository notificationRepository;

    public NotificationResource(NotificationService notificationService, NotificationRepository notificationRepository) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * POST /notifications : Create notification (internal / admin only).
     */
    @PostMapping("/notifications")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody NotificationDTO notificationDTO)
        throws URISyntaxException {
        log.debug("REST request to save Notification : {}", notificationDTO);
        if (notificationDTO.getId() != null) {
            throw new BadRequestAlertException("A new notification cannot already have an ID", ENTITY_NAME, "idexists");
        }
        NotificationDTO result = notificationService.save(notificationDTO);
        return ResponseEntity
            .created(new URI("/api/notifications/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET /notifications : get notifications for the currently authenticated user.
     */
    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        log.debug("REST request to get Notifications for user: {}", currentLogin);
        Page<NotificationDTO> page = notificationService.findByRecipientLogin(currentLogin, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET /notifications/{id} : get one notification (owner only).
     */
    @GetMapping("/notifications/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> getNotification(@PathVariable Long id) {
        log.debug("REST request to get Notification : {}", id);
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Optional<NotificationDTO> notificationDTO = notificationService.findOne(id);
        notificationDTO.ifPresent(n -> {
            if (!currentLogin.equals(n.getRecipientLogin())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            }
        });
        return ResponseUtil.wrapOrNotFound(notificationDTO);
    }

    /**
     * PUT /notifications/{id}/read : mark a notification as read (owner only).
     */
    @PutMapping("/notifications/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        log.debug("REST request to mark Notification {} as read", id);
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        NotificationDTO notificationDTO = notificationService.findOne(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!currentLogin.equals(notificationDTO.getRecipientLogin())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        notificationDTO.setIsRead(true);
        notificationDTO.setReadAt(ZonedDateTime.now());
        NotificationDTO result = notificationService.update(notificationDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    /**
     * DELETE /notifications/{id} : delete a notification (ROLE_ADMIN_SYSTEME only).
     */
    @DeleteMapping("/notifications/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        log.debug("REST request to delete Notification : {}", id);
        notificationService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
