package com.tunisales.platform.web.rest;

import static com.tunisales.platform.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tunisales.platform.IntegrationTest;
import com.tunisales.platform.domain.Notification;
import com.tunisales.platform.domain.enumeration.NotificationType;
import com.tunisales.platform.repository.NotificationRepository;
import com.tunisales.platform.service.criteria.NotificationCriteria;
import com.tunisales.platform.service.dto.NotificationDTO;
import com.tunisales.platform.service.mapper.NotificationMapper;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link NotificationResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class NotificationResourceIT {

    private static final Long DEFAULT_TENANT_ID = 1L;
    private static final Long UPDATED_TENANT_ID = 2L;
    private static final Long SMALLER_TENANT_ID = 1L - 1L;

    private static final String DEFAULT_RECIPIENT_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_RECIPIENT_LOGIN = "BBBBBBBBBB";

    private static final NotificationType DEFAULT_TYPE = NotificationType.STOCK_ALERT;
    private static final NotificationType UPDATED_TYPE = NotificationType.APPROVAL_REQUIRED;

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_BODY = "AAAAAAAAAA";
    private static final String UPDATED_BODY = "BBBBBBBBBB";

    private static final String DEFAULT_PAYLOAD_JSON = "AAAAAAAAAA";
    private static final String UPDATED_PAYLOAD_JSON = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_READ = false;
    private static final Boolean UPDATED_IS_READ = true;

    private static final ZonedDateTime DEFAULT_READ_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_READ_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_READ_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final ZonedDateTime DEFAULT_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final String ENTITY_API_URL = "/api/notifications";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationMapper notificationMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNotificationMockMvc;

    private Notification notification;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Notification createEntity(EntityManager em) {
        Notification notification = new Notification()
            .tenantId(DEFAULT_TENANT_ID)
            .recipientLogin(DEFAULT_RECIPIENT_LOGIN)
            .type(DEFAULT_TYPE)
            .title(DEFAULT_TITLE)
            .body(DEFAULT_BODY)
            .payloadJson(DEFAULT_PAYLOAD_JSON)
            .isRead(DEFAULT_IS_READ)
            .readAt(DEFAULT_READ_AT)
            .createdAt(DEFAULT_CREATED_AT);
        return notification;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Notification createUpdatedEntity(EntityManager em) {
        Notification notification = new Notification()
            .tenantId(UPDATED_TENANT_ID)
            .recipientLogin(UPDATED_RECIPIENT_LOGIN)
            .type(UPDATED_TYPE)
            .title(UPDATED_TITLE)
            .body(UPDATED_BODY)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .isRead(UPDATED_IS_READ)
            .readAt(UPDATED_READ_AT)
            .createdAt(UPDATED_CREATED_AT);
        return notification;
    }

    @BeforeEach
    public void initTest() {
        notification = createEntity(em);
    }

    @Test
    @Transactional
    void createNotification() throws Exception {
        int databaseSizeBeforeCreate = notificationRepository.findAll().size();
        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);
        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isCreated());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeCreate + 1);
        Notification testNotification = notificationList.get(notificationList.size() - 1);
        assertThat(testNotification.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testNotification.getRecipientLogin()).isEqualTo(DEFAULT_RECIPIENT_LOGIN);
        assertThat(testNotification.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testNotification.getTitle()).isEqualTo(DEFAULT_TITLE);
        assertThat(testNotification.getBody()).isEqualTo(DEFAULT_BODY);
        assertThat(testNotification.getPayloadJson()).isEqualTo(DEFAULT_PAYLOAD_JSON);
        assertThat(testNotification.getIsRead()).isEqualTo(DEFAULT_IS_READ);
        assertThat(testNotification.getReadAt()).isEqualTo(DEFAULT_READ_AT);
        assertThat(testNotification.getCreatedAt()).isEqualTo(DEFAULT_CREATED_AT);
    }

    @Test
    @Transactional
    void createNotificationWithExistingId() throws Exception {
        // Create the Notification with an existing ID
        notification.setId(1L);
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        int databaseSizeBeforeCreate = notificationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTenantIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = notificationRepository.findAll().size();
        // set the field null
        notification.setTenantId(null);

        // Create the Notification, which fails.
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRecipientLoginIsRequired() throws Exception {
        int databaseSizeBeforeTest = notificationRepository.findAll().size();
        // set the field null
        notification.setRecipientLogin(null);

        // Create the Notification, which fails.
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = notificationRepository.findAll().size();
        // set the field null
        notification.setType(null);

        // Create the Notification, which fails.
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        int databaseSizeBeforeTest = notificationRepository.findAll().size();
        // set the field null
        notification.setTitle(null);

        // Create the Notification, which fails.
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsReadIsRequired() throws Exception {
        int databaseSizeBeforeTest = notificationRepository.findAll().size();
        // set the field null
        notification.setIsRead(null);

        // Create the Notification, which fails.
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        int databaseSizeBeforeTest = notificationRepository.findAll().size();
        // set the field null
        notification.setCreatedAt(null);

        // Create the Notification, which fails.
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        restNotificationMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllNotifications() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList
        restNotificationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(notification.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].recipientLogin").value(hasItem(DEFAULT_RECIPIENT_LOGIN)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].body").value(hasItem(DEFAULT_BODY)))
            .andExpect(jsonPath("$.[*].payloadJson").value(hasItem(DEFAULT_PAYLOAD_JSON.toString())))
            .andExpect(jsonPath("$.[*].isRead").value(hasItem(DEFAULT_IS_READ.booleanValue())))
            .andExpect(jsonPath("$.[*].readAt").value(hasItem(sameInstant(DEFAULT_READ_AT))))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))));
    }

    @Test
    @Transactional
    void getNotification() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get the notification
        restNotificationMockMvc
            .perform(get(ENTITY_API_URL_ID, notification.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(notification.getId().intValue()))
            .andExpect(jsonPath("$.tenantId").value(DEFAULT_TENANT_ID.intValue()))
            .andExpect(jsonPath("$.recipientLogin").value(DEFAULT_RECIPIENT_LOGIN))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.body").value(DEFAULT_BODY))
            .andExpect(jsonPath("$.payloadJson").value(DEFAULT_PAYLOAD_JSON.toString()))
            .andExpect(jsonPath("$.isRead").value(DEFAULT_IS_READ.booleanValue()))
            .andExpect(jsonPath("$.readAt").value(sameInstant(DEFAULT_READ_AT)))
            .andExpect(jsonPath("$.createdAt").value(sameInstant(DEFAULT_CREATED_AT)));
    }

    @Test
    @Transactional
    void getNotificationsByIdFiltering() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        Long id = notification.getId();

        defaultNotificationShouldBeFound("id.equals=" + id);
        defaultNotificationShouldNotBeFound("id.notEquals=" + id);

        defaultNotificationShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultNotificationShouldNotBeFound("id.greaterThan=" + id);

        defaultNotificationShouldBeFound("id.lessThanOrEqual=" + id);
        defaultNotificationShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId equals to DEFAULT_TENANT_ID
        defaultNotificationShouldBeFound("tenantId.equals=" + DEFAULT_TENANT_ID);

        // Get all the notificationList where tenantId equals to UPDATED_TENANT_ID
        defaultNotificationShouldNotBeFound("tenantId.equals=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId in DEFAULT_TENANT_ID or UPDATED_TENANT_ID
        defaultNotificationShouldBeFound("tenantId.in=" + DEFAULT_TENANT_ID + "," + UPDATED_TENANT_ID);

        // Get all the notificationList where tenantId equals to UPDATED_TENANT_ID
        defaultNotificationShouldNotBeFound("tenantId.in=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId is not null
        defaultNotificationShouldBeFound("tenantId.specified=true");

        // Get all the notificationList where tenantId is null
        defaultNotificationShouldNotBeFound("tenantId.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId is greater than or equal to DEFAULT_TENANT_ID
        defaultNotificationShouldBeFound("tenantId.greaterThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the notificationList where tenantId is greater than or equal to UPDATED_TENANT_ID
        defaultNotificationShouldNotBeFound("tenantId.greaterThanOrEqual=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId is less than or equal to DEFAULT_TENANT_ID
        defaultNotificationShouldBeFound("tenantId.lessThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the notificationList where tenantId is less than or equal to SMALLER_TENANT_ID
        defaultNotificationShouldNotBeFound("tenantId.lessThanOrEqual=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsLessThanSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId is less than DEFAULT_TENANT_ID
        defaultNotificationShouldNotBeFound("tenantId.lessThan=" + DEFAULT_TENANT_ID);

        // Get all the notificationList where tenantId is less than UPDATED_TENANT_ID
        defaultNotificationShouldBeFound("tenantId.lessThan=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllNotificationsByTenantIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where tenantId is greater than DEFAULT_TENANT_ID
        defaultNotificationShouldNotBeFound("tenantId.greaterThan=" + DEFAULT_TENANT_ID);

        // Get all the notificationList where tenantId is greater than SMALLER_TENANT_ID
        defaultNotificationShouldBeFound("tenantId.greaterThan=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllNotificationsByRecipientLoginIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where recipientLogin equals to DEFAULT_RECIPIENT_LOGIN
        defaultNotificationShouldBeFound("recipientLogin.equals=" + DEFAULT_RECIPIENT_LOGIN);

        // Get all the notificationList where recipientLogin equals to UPDATED_RECIPIENT_LOGIN
        defaultNotificationShouldNotBeFound("recipientLogin.equals=" + UPDATED_RECIPIENT_LOGIN);
    }

    @Test
    @Transactional
    void getAllNotificationsByRecipientLoginIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where recipientLogin in DEFAULT_RECIPIENT_LOGIN or UPDATED_RECIPIENT_LOGIN
        defaultNotificationShouldBeFound("recipientLogin.in=" + DEFAULT_RECIPIENT_LOGIN + "," + UPDATED_RECIPIENT_LOGIN);

        // Get all the notificationList where recipientLogin equals to UPDATED_RECIPIENT_LOGIN
        defaultNotificationShouldNotBeFound("recipientLogin.in=" + UPDATED_RECIPIENT_LOGIN);
    }

    @Test
    @Transactional
    void getAllNotificationsByRecipientLoginIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where recipientLogin is not null
        defaultNotificationShouldBeFound("recipientLogin.specified=true");

        // Get all the notificationList where recipientLogin is null
        defaultNotificationShouldNotBeFound("recipientLogin.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByRecipientLoginContainsSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where recipientLogin contains DEFAULT_RECIPIENT_LOGIN
        defaultNotificationShouldBeFound("recipientLogin.contains=" + DEFAULT_RECIPIENT_LOGIN);

        // Get all the notificationList where recipientLogin contains UPDATED_RECIPIENT_LOGIN
        defaultNotificationShouldNotBeFound("recipientLogin.contains=" + UPDATED_RECIPIENT_LOGIN);
    }

    @Test
    @Transactional
    void getAllNotificationsByRecipientLoginNotContainsSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where recipientLogin does not contain DEFAULT_RECIPIENT_LOGIN
        defaultNotificationShouldNotBeFound("recipientLogin.doesNotContain=" + DEFAULT_RECIPIENT_LOGIN);

        // Get all the notificationList where recipientLogin does not contain UPDATED_RECIPIENT_LOGIN
        defaultNotificationShouldBeFound("recipientLogin.doesNotContain=" + UPDATED_RECIPIENT_LOGIN);
    }

    @Test
    @Transactional
    void getAllNotificationsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where type equals to DEFAULT_TYPE
        defaultNotificationShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the notificationList where type equals to UPDATED_TYPE
        defaultNotificationShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllNotificationsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultNotificationShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the notificationList where type equals to UPDATED_TYPE
        defaultNotificationShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllNotificationsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where type is not null
        defaultNotificationShouldBeFound("type.specified=true");

        // Get all the notificationList where type is null
        defaultNotificationShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByTitleIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where title equals to DEFAULT_TITLE
        defaultNotificationShouldBeFound("title.equals=" + DEFAULT_TITLE);

        // Get all the notificationList where title equals to UPDATED_TITLE
        defaultNotificationShouldNotBeFound("title.equals=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllNotificationsByTitleIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where title in DEFAULT_TITLE or UPDATED_TITLE
        defaultNotificationShouldBeFound("title.in=" + DEFAULT_TITLE + "," + UPDATED_TITLE);

        // Get all the notificationList where title equals to UPDATED_TITLE
        defaultNotificationShouldNotBeFound("title.in=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllNotificationsByTitleIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where title is not null
        defaultNotificationShouldBeFound("title.specified=true");

        // Get all the notificationList where title is null
        defaultNotificationShouldNotBeFound("title.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByTitleContainsSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where title contains DEFAULT_TITLE
        defaultNotificationShouldBeFound("title.contains=" + DEFAULT_TITLE);

        // Get all the notificationList where title contains UPDATED_TITLE
        defaultNotificationShouldNotBeFound("title.contains=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllNotificationsByTitleNotContainsSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where title does not contain DEFAULT_TITLE
        defaultNotificationShouldNotBeFound("title.doesNotContain=" + DEFAULT_TITLE);

        // Get all the notificationList where title does not contain UPDATED_TITLE
        defaultNotificationShouldBeFound("title.doesNotContain=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllNotificationsByBodyIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where body equals to DEFAULT_BODY
        defaultNotificationShouldBeFound("body.equals=" + DEFAULT_BODY);

        // Get all the notificationList where body equals to UPDATED_BODY
        defaultNotificationShouldNotBeFound("body.equals=" + UPDATED_BODY);
    }

    @Test
    @Transactional
    void getAllNotificationsByBodyIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where body in DEFAULT_BODY or UPDATED_BODY
        defaultNotificationShouldBeFound("body.in=" + DEFAULT_BODY + "," + UPDATED_BODY);

        // Get all the notificationList where body equals to UPDATED_BODY
        defaultNotificationShouldNotBeFound("body.in=" + UPDATED_BODY);
    }

    @Test
    @Transactional
    void getAllNotificationsByBodyIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where body is not null
        defaultNotificationShouldBeFound("body.specified=true");

        // Get all the notificationList where body is null
        defaultNotificationShouldNotBeFound("body.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByBodyContainsSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where body contains DEFAULT_BODY
        defaultNotificationShouldBeFound("body.contains=" + DEFAULT_BODY);

        // Get all the notificationList where body contains UPDATED_BODY
        defaultNotificationShouldNotBeFound("body.contains=" + UPDATED_BODY);
    }

    @Test
    @Transactional
    void getAllNotificationsByBodyNotContainsSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where body does not contain DEFAULT_BODY
        defaultNotificationShouldNotBeFound("body.doesNotContain=" + DEFAULT_BODY);

        // Get all the notificationList where body does not contain UPDATED_BODY
        defaultNotificationShouldBeFound("body.doesNotContain=" + UPDATED_BODY);
    }

    @Test
    @Transactional
    void getAllNotificationsByIsReadIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where isRead equals to DEFAULT_IS_READ
        defaultNotificationShouldBeFound("isRead.equals=" + DEFAULT_IS_READ);

        // Get all the notificationList where isRead equals to UPDATED_IS_READ
        defaultNotificationShouldNotBeFound("isRead.equals=" + UPDATED_IS_READ);
    }

    @Test
    @Transactional
    void getAllNotificationsByIsReadIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where isRead in DEFAULT_IS_READ or UPDATED_IS_READ
        defaultNotificationShouldBeFound("isRead.in=" + DEFAULT_IS_READ + "," + UPDATED_IS_READ);

        // Get all the notificationList where isRead equals to UPDATED_IS_READ
        defaultNotificationShouldNotBeFound("isRead.in=" + UPDATED_IS_READ);
    }

    @Test
    @Transactional
    void getAllNotificationsByIsReadIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where isRead is not null
        defaultNotificationShouldBeFound("isRead.specified=true");

        // Get all the notificationList where isRead is null
        defaultNotificationShouldNotBeFound("isRead.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt equals to DEFAULT_READ_AT
        defaultNotificationShouldBeFound("readAt.equals=" + DEFAULT_READ_AT);

        // Get all the notificationList where readAt equals to UPDATED_READ_AT
        defaultNotificationShouldNotBeFound("readAt.equals=" + UPDATED_READ_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt in DEFAULT_READ_AT or UPDATED_READ_AT
        defaultNotificationShouldBeFound("readAt.in=" + DEFAULT_READ_AT + "," + UPDATED_READ_AT);

        // Get all the notificationList where readAt equals to UPDATED_READ_AT
        defaultNotificationShouldNotBeFound("readAt.in=" + UPDATED_READ_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt is not null
        defaultNotificationShouldBeFound("readAt.specified=true");

        // Get all the notificationList where readAt is null
        defaultNotificationShouldNotBeFound("readAt.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt is greater than or equal to DEFAULT_READ_AT
        defaultNotificationShouldBeFound("readAt.greaterThanOrEqual=" + DEFAULT_READ_AT);

        // Get all the notificationList where readAt is greater than or equal to UPDATED_READ_AT
        defaultNotificationShouldNotBeFound("readAt.greaterThanOrEqual=" + UPDATED_READ_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt is less than or equal to DEFAULT_READ_AT
        defaultNotificationShouldBeFound("readAt.lessThanOrEqual=" + DEFAULT_READ_AT);

        // Get all the notificationList where readAt is less than or equal to SMALLER_READ_AT
        defaultNotificationShouldNotBeFound("readAt.lessThanOrEqual=" + SMALLER_READ_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsLessThanSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt is less than DEFAULT_READ_AT
        defaultNotificationShouldNotBeFound("readAt.lessThan=" + DEFAULT_READ_AT);

        // Get all the notificationList where readAt is less than UPDATED_READ_AT
        defaultNotificationShouldBeFound("readAt.lessThan=" + UPDATED_READ_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByReadAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where readAt is greater than DEFAULT_READ_AT
        defaultNotificationShouldNotBeFound("readAt.greaterThan=" + DEFAULT_READ_AT);

        // Get all the notificationList where readAt is greater than SMALLER_READ_AT
        defaultNotificationShouldBeFound("readAt.greaterThan=" + SMALLER_READ_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt equals to DEFAULT_CREATED_AT
        defaultNotificationShouldBeFound("createdAt.equals=" + DEFAULT_CREATED_AT);

        // Get all the notificationList where createdAt equals to UPDATED_CREATED_AT
        defaultNotificationShouldNotBeFound("createdAt.equals=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt in DEFAULT_CREATED_AT or UPDATED_CREATED_AT
        defaultNotificationShouldBeFound("createdAt.in=" + DEFAULT_CREATED_AT + "," + UPDATED_CREATED_AT);

        // Get all the notificationList where createdAt equals to UPDATED_CREATED_AT
        defaultNotificationShouldNotBeFound("createdAt.in=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt is not null
        defaultNotificationShouldBeFound("createdAt.specified=true");

        // Get all the notificationList where createdAt is null
        defaultNotificationShouldNotBeFound("createdAt.specified=false");
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt is greater than or equal to DEFAULT_CREATED_AT
        defaultNotificationShouldBeFound("createdAt.greaterThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the notificationList where createdAt is greater than or equal to UPDATED_CREATED_AT
        defaultNotificationShouldNotBeFound("createdAt.greaterThanOrEqual=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt is less than or equal to DEFAULT_CREATED_AT
        defaultNotificationShouldBeFound("createdAt.lessThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the notificationList where createdAt is less than or equal to SMALLER_CREATED_AT
        defaultNotificationShouldNotBeFound("createdAt.lessThanOrEqual=" + SMALLER_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt is less than DEFAULT_CREATED_AT
        defaultNotificationShouldNotBeFound("createdAt.lessThan=" + DEFAULT_CREATED_AT);

        // Get all the notificationList where createdAt is less than UPDATED_CREATED_AT
        defaultNotificationShouldBeFound("createdAt.lessThan=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllNotificationsByCreatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        // Get all the notificationList where createdAt is greater than DEFAULT_CREATED_AT
        defaultNotificationShouldNotBeFound("createdAt.greaterThan=" + DEFAULT_CREATED_AT);

        // Get all the notificationList where createdAt is greater than SMALLER_CREATED_AT
        defaultNotificationShouldBeFound("createdAt.greaterThan=" + SMALLER_CREATED_AT);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultNotificationShouldBeFound(String filter) throws Exception {
        restNotificationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(notification.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].recipientLogin").value(hasItem(DEFAULT_RECIPIENT_LOGIN)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].body").value(hasItem(DEFAULT_BODY)))
            .andExpect(jsonPath("$.[*].payloadJson").value(hasItem(DEFAULT_PAYLOAD_JSON.toString())))
            .andExpect(jsonPath("$.[*].isRead").value(hasItem(DEFAULT_IS_READ.booleanValue())))
            .andExpect(jsonPath("$.[*].readAt").value(hasItem(sameInstant(DEFAULT_READ_AT))))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))));

        // Check, that the count call also returns 1
        restNotificationMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultNotificationShouldNotBeFound(String filter) throws Exception {
        restNotificationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restNotificationMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingNotification() throws Exception {
        // Get the notification
        restNotificationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingNotification() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();

        // Update the notification
        Notification updatedNotification = notificationRepository.findById(notification.getId()).get();
        // Disconnect from session so that the updates on updatedNotification are not directly saved in db
        em.detach(updatedNotification);
        updatedNotification
            .tenantId(UPDATED_TENANT_ID)
            .recipientLogin(UPDATED_RECIPIENT_LOGIN)
            .type(UPDATED_TYPE)
            .title(UPDATED_TITLE)
            .body(UPDATED_BODY)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .isRead(UPDATED_IS_READ)
            .readAt(UPDATED_READ_AT)
            .createdAt(UPDATED_CREATED_AT);
        NotificationDTO notificationDTO = notificationMapper.toDto(updatedNotification);

        restNotificationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, notificationDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isOk());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
        Notification testNotification = notificationList.get(notificationList.size() - 1);
        assertThat(testNotification.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testNotification.getRecipientLogin()).isEqualTo(UPDATED_RECIPIENT_LOGIN);
        assertThat(testNotification.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testNotification.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testNotification.getBody()).isEqualTo(UPDATED_BODY);
        assertThat(testNotification.getPayloadJson()).isEqualTo(UPDATED_PAYLOAD_JSON);
        assertThat(testNotification.getIsRead()).isEqualTo(UPDATED_IS_READ);
        assertThat(testNotification.getReadAt()).isEqualTo(UPDATED_READ_AT);
        assertThat(testNotification.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void putNonExistingNotification() throws Exception {
        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();
        notification.setId(count.incrementAndGet());

        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNotificationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, notificationDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNotification() throws Exception {
        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();
        notification.setId(count.incrementAndGet());

        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNotification() throws Exception {
        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();
        notification.setId(count.incrementAndGet());

        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationMockMvc
            .perform(
                put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNotificationWithPatch() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();

        // Update the notification using partial update
        Notification partialUpdatedNotification = new Notification();
        partialUpdatedNotification.setId(notification.getId());

        partialUpdatedNotification
            .type(UPDATED_TYPE)
            .title(UPDATED_TITLE)
            .body(UPDATED_BODY)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .isRead(UPDATED_IS_READ)
            .createdAt(UPDATED_CREATED_AT);

        restNotificationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNotification.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedNotification))
            )
            .andExpect(status().isOk());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
        Notification testNotification = notificationList.get(notificationList.size() - 1);
        assertThat(testNotification.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testNotification.getRecipientLogin()).isEqualTo(DEFAULT_RECIPIENT_LOGIN);
        assertThat(testNotification.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testNotification.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testNotification.getBody()).isEqualTo(UPDATED_BODY);
        assertThat(testNotification.getPayloadJson()).isEqualTo(UPDATED_PAYLOAD_JSON);
        assertThat(testNotification.getIsRead()).isEqualTo(UPDATED_IS_READ);
        assertThat(testNotification.getReadAt()).isEqualTo(DEFAULT_READ_AT);
        assertThat(testNotification.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void fullUpdateNotificationWithPatch() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();

        // Update the notification using partial update
        Notification partialUpdatedNotification = new Notification();
        partialUpdatedNotification.setId(notification.getId());

        partialUpdatedNotification
            .tenantId(UPDATED_TENANT_ID)
            .recipientLogin(UPDATED_RECIPIENT_LOGIN)
            .type(UPDATED_TYPE)
            .title(UPDATED_TITLE)
            .body(UPDATED_BODY)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .isRead(UPDATED_IS_READ)
            .readAt(UPDATED_READ_AT)
            .createdAt(UPDATED_CREATED_AT);

        restNotificationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNotification.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedNotification))
            )
            .andExpect(status().isOk());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
        Notification testNotification = notificationList.get(notificationList.size() - 1);
        assertThat(testNotification.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testNotification.getRecipientLogin()).isEqualTo(UPDATED_RECIPIENT_LOGIN);
        assertThat(testNotification.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testNotification.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testNotification.getBody()).isEqualTo(UPDATED_BODY);
        assertThat(testNotification.getPayloadJson()).isEqualTo(UPDATED_PAYLOAD_JSON);
        assertThat(testNotification.getIsRead()).isEqualTo(UPDATED_IS_READ);
        assertThat(testNotification.getReadAt()).isEqualTo(UPDATED_READ_AT);
        assertThat(testNotification.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void patchNonExistingNotification() throws Exception {
        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();
        notification.setId(count.incrementAndGet());

        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNotificationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, notificationDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNotification() throws Exception {
        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();
        notification.setId(count.incrementAndGet());

        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNotification() throws Exception {
        int databaseSizeBeforeUpdate = notificationRepository.findAll().size();
        notification.setId(count.incrementAndGet());

        // Create the Notification
        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(notificationDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Notification in the database
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNotification() throws Exception {
        // Initialize the database
        notificationRepository.saveAndFlush(notification);

        int databaseSizeBeforeDelete = notificationRepository.findAll().size();

        // Delete the notification
        restNotificationMockMvc
            .perform(delete(ENTITY_API_URL_ID, notification.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Notification> notificationList = notificationRepository.findAll();
        assertThat(notificationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
