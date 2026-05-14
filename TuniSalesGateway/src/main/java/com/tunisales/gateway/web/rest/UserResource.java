package com.tunisales.gateway.web.rest;

import com.tunisales.gateway.config.Constants;
import com.tunisales.gateway.domain.User;
import com.tunisales.gateway.repository.UserRepository;
import com.tunisales.gateway.security.AuthoritiesConstants;
import com.tunisales.gateway.service.MailService;
import com.tunisales.gateway.service.UserService;
import com.tunisales.gateway.service.dto.AdminUserDTO;
import com.tunisales.gateway.web.rest.errors.BadRequestAlertException;
import com.tunisales.gateway.web.rest.errors.EmailAlreadyUsedException;
import com.tunisales.gateway.web.rest.errors.LoginAlreadyUsedException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;

/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/api/admin")
public class UserResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = Collections.unmodifiableList(
        Arrays.asList(
            "id",
            "login",
            "firstName",
            "lastName",
            "email",
            "activated",
            "langKey",
            "createdBy",
            "createdDate",
            "lastModifiedBy",
            "lastModifiedDate"
        )
    );

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserService userService;

    private final UserRepository userRepository;

    private final MailService mailService;

    public UserResource(UserService userService, UserRepository userRepository, MailService mailService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    /**
     * POST /admin/users : Creates a new user with activated = false by default.
     * Only ROLE_ADMIN_SYSTEME may create users.
     */
    @PostMapping("/users")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public Mono<ResponseEntity<User>> createUser(@Valid @RequestBody AdminUserDTO userDTO) {
        log.debug("REST request to save User : {}", userDTO);

        if (userDTO.getId() != null) {
            throw new BadRequestAlertException("A new user cannot already have an ID", "userManagement", "idexists");
        }
        // New users are INACTIVE by default — only an admin can activate them later
        userDTO.setActivated(false);

        return userRepository
            .findOneByLogin(userDTO.getLogin().toLowerCase())
            .hasElement()
            .flatMap(loginExists -> {
                if (Boolean.TRUE.equals(loginExists)) {
                    return Mono.error(new LoginAlreadyUsedException());
                }
                return userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
            })
            .hasElement()
            .flatMap(emailExists -> {
                if (Boolean.TRUE.equals(emailExists)) {
                    return Mono.error(new EmailAlreadyUsedException());
                }
                return userService.createUser(userDTO);
            })
            .doOnSuccess(mailService::sendCreationEmail)
            .map(user -> {
                try {
                    return ResponseEntity
                        .created(new URI("/api/admin/users/" + user.getLogin()))
                        .headers(HeaderUtil.createAlert(applicationName, "userManagement.created", user.getLogin()))
                        .body(user);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * PUT /admin/users : Updates an existing User (roles, profile).
     * ROLE_ADMIN_SYSTEME only.
     */
    @PutMapping("/users")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public Mono<ResponseEntity<AdminUserDTO>> updateUser(@Valid @RequestBody AdminUserDTO userDTO) {
        log.debug("REST request to update User : {}", userDTO);
        return userRepository
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            .filter(user -> !user.getId().equals(userDTO.getId()))
            .hasElement()
            .flatMap(emailExists -> {
                if (Boolean.TRUE.equals(emailExists)) {
                    return Mono.error(new EmailAlreadyUsedException());
                }
                return userRepository.findOneByLogin(userDTO.getLogin().toLowerCase());
            })
            .filter(user -> !user.getId().equals(userDTO.getId()))
            .hasElement()
            .flatMap(loginExists -> {
                if (Boolean.TRUE.equals(loginExists)) {
                    return Mono.error(new LoginAlreadyUsedException());
                }
                return userService.updateUser(userDTO);
            })
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
            .map(user ->
                ResponseEntity
                    .ok()
                    .headers(HeaderUtil.createAlert(applicationName, "userManagement.updated", userDTO.getLogin()))
                    .body(user)
            );
    }

    /**
     * PATCH /admin/users/{login}/activate : Activate or deactivate a user account.
     * ROLE_ADMIN_SYSTEME and ROLE_ADMIN_COMMERCIAL may activate/deactivate.
     */
    @PatchMapping("/users/{login}/activate")
    @PreAuthorize(
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public Mono<ResponseEntity<AdminUserDTO>> setUserActivation(
        @PathVariable @Pattern(regexp = Constants.LOGIN_REGEX) String login,
        @RequestParam boolean activated
    ) {
        log.debug("REST request to set activation={} for User: {}", activated, login);
        return userService
            .getUserWithAuthoritiesByLogin(login)
            .flatMap(user -> {
                AdminUserDTO dto = new AdminUserDTO(user);
                dto.setActivated(activated);
                return userService.updateUser(dto);
            })
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
            .map(user -> ResponseEntity.ok().body(user));
    }

    /**
     * GET /admin/users : get all users.
     * ROLE_ADMIN_SYSTEME and ROLE_ADMIN_COMMERCIAL may read the list.
     */
    @GetMapping("/users")
    @PreAuthorize(
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public Mono<ResponseEntity<Flux<AdminUserDTO>>> getAllUsers(
        @org.springdoc.api.annotations.ParameterObject ServerHttpRequest request,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get all Users for admin");
        if (!onlyContainsAllowedProperties(pageable)) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return userService
            .countManagedUsers()
            .map(total -> new PageImpl<>(new ArrayList<>(), pageable, total))
            .map(page -> PaginationUtil.generatePaginationHttpHeaders(UriComponentsBuilder.fromHttpRequest(request), page))
            .map(headers -> ResponseEntity.ok().headers(headers).body(userService.getAllManagedUsers(pageable)));
    }

    private boolean onlyContainsAllowedProperties(Pageable pageable) {
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }

    /**
     * GET /admin/users/{login} : get the "login" user.
     * ROLE_ADMIN_SYSTEME and ROLE_ADMIN_COMMERCIAL may read.
     */
    @GetMapping("/users/{login}")
    @PreAuthorize(
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public Mono<AdminUserDTO> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return userService
            .getUserWithAuthoritiesByLogin(login)
            .map(AdminUserDTO::new)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    /**
     * DELETE /admin/users/{login} : delete the "login" User.
     * ROLE_ADMIN_SYSTEME only.
     */
    @DeleteMapping("/users/{login}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable @Pattern(regexp = Constants.LOGIN_REGEX) String login) {
        log.debug("REST request to delete User: {}", login);
        return userService
            .deleteUser(login)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createAlert(applicationName, "userManagement.deleted", login)).<Void>build()
                )
            );
    }
}
