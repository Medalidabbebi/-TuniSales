package com.tunisales.platform.web.rest;

import static com.tunisales.platform.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tunisales.platform.IntegrationTest;
import com.tunisales.platform.domain.AuditLog;
import com.tunisales.platform.domain.enumeration.AuditAction;
import com.tunisales.platform.repository.AuditLogRepository;
import com.tunisales.platform.service.criteria.AuditLogCriteria;
import com.tunisales.platform.service.dto.AuditLogDTO;
import com.tunisales.platform.service.mapper.AuditLogMapper;
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
 * Integration tests for the {@link AuditLogResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AuditLogResourceIT {

    private static final Long DEFAULT_TENANT_ID = 1L;
    private static final Long UPDATED_TENANT_ID = 2L;
    private static final Long SMALLER_TENANT_ID = 1L - 1L;

    private static final String DEFAULT_ENTITY_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_ENTITY_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY_ID = "BBBBBBBBBB";

    private static final AuditAction DEFAULT_ACTION = AuditAction.CREATE;
    private static final AuditAction UPDATED_ACTION = AuditAction.UPDATE;

    private static final String DEFAULT_BEFORE_JSON = "AAAAAAAAAA";
    private static final String UPDATED_BEFORE_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_AFTER_JSON = "AAAAAAAAAA";
    private static final String UPDATED_AFTER_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_IP_ADDRESS = "AAAAAAAAAA";
    private static final String UPDATED_IP_ADDRESS = "BBBBBBBBBB";

    private static final String DEFAULT_USER_AGENT = "AAAAAAAAAA";
    private static final String UPDATED_USER_AGENT = "BBBBBBBBBB";

    private static final String DEFAULT_PERFORMED_BY_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_PERFORMED_BY_LOGIN = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final String ENTITY_API_URL = "/api/audit-logs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogMapper auditLogMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAuditLogMockMvc;

    private AuditLog auditLog;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AuditLog createEntity(EntityManager em) {
        AuditLog auditLog = new AuditLog()
            .tenantId(DEFAULT_TENANT_ID)
            .entityType(DEFAULT_ENTITY_TYPE)
            .entityId(DEFAULT_ENTITY_ID)
            .action(DEFAULT_ACTION)
            .beforeJson(DEFAULT_BEFORE_JSON)
            .afterJson(DEFAULT_AFTER_JSON)
            .ipAddress(DEFAULT_IP_ADDRESS)
            .userAgent(DEFAULT_USER_AGENT)
            .performedByLogin(DEFAULT_PERFORMED_BY_LOGIN)
            .createdAt(DEFAULT_CREATED_AT);
        return auditLog;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AuditLog createUpdatedEntity(EntityManager em) {
        AuditLog auditLog = new AuditLog()
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .entityId(UPDATED_ENTITY_ID)
            .action(UPDATED_ACTION)
            .beforeJson(UPDATED_BEFORE_JSON)
            .afterJson(UPDATED_AFTER_JSON)
            .ipAddress(UPDATED_IP_ADDRESS)
            .userAgent(UPDATED_USER_AGENT)
            .performedByLogin(UPDATED_PERFORMED_BY_LOGIN)
            .createdAt(UPDATED_CREATED_AT);
        return auditLog;
    }

    @BeforeEach
    public void initTest() {
        auditLog = createEntity(em);
    }

    @Test
    @Transactional
    void createAuditLog() throws Exception {
        int databaseSizeBeforeCreate = auditLogRepository.findAll().size();
        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);
        restAuditLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(auditLogDTO)))
            .andExpect(status().isCreated());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeCreate + 1);
        AuditLog testAuditLog = auditLogList.get(auditLogList.size() - 1);
        assertThat(testAuditLog.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testAuditLog.getEntityType()).isEqualTo(DEFAULT_ENTITY_TYPE);
        assertThat(testAuditLog.getEntityId()).isEqualTo(DEFAULT_ENTITY_ID);
        assertThat(testAuditLog.getAction()).isEqualTo(DEFAULT_ACTION);
        assertThat(testAuditLog.getBeforeJson()).isEqualTo(DEFAULT_BEFORE_JSON);
        assertThat(testAuditLog.getAfterJson()).isEqualTo(DEFAULT_AFTER_JSON);
        assertThat(testAuditLog.getIpAddress()).isEqualTo(DEFAULT_IP_ADDRESS);
        assertThat(testAuditLog.getUserAgent()).isEqualTo(DEFAULT_USER_AGENT);
        assertThat(testAuditLog.getPerformedByLogin()).isEqualTo(DEFAULT_PERFORMED_BY_LOGIN);
        assertThat(testAuditLog.getCreatedAt()).isEqualTo(DEFAULT_CREATED_AT);
    }

    @Test
    @Transactional
    void createAuditLogWithExistingId() throws Exception {
        // Create the AuditLog with an existing ID
        auditLog.setId(1L);
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        int databaseSizeBeforeCreate = auditLogRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAuditLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(auditLogDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEntityTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = auditLogRepository.findAll().size();
        // set the field null
        auditLog.setEntityType(null);

        // Create the AuditLog, which fails.
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        restAuditLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(auditLogDTO)))
            .andExpect(status().isBadRequest());

        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActionIsRequired() throws Exception {
        int databaseSizeBeforeTest = auditLogRepository.findAll().size();
        // set the field null
        auditLog.setAction(null);

        // Create the AuditLog, which fails.
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        restAuditLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(auditLogDTO)))
            .andExpect(status().isBadRequest());

        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        int databaseSizeBeforeTest = auditLogRepository.findAll().size();
        // set the field null
        auditLog.setCreatedAt(null);

        // Create the AuditLog, which fails.
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        restAuditLogMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(auditLogDTO)))
            .andExpect(status().isBadRequest());

        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAuditLogs() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList
        restAuditLogMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(auditLog.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].entityType").value(hasItem(DEFAULT_ENTITY_TYPE)))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID)))
            .andExpect(jsonPath("$.[*].action").value(hasItem(DEFAULT_ACTION.toString())))
            .andExpect(jsonPath("$.[*].beforeJson").value(hasItem(DEFAULT_BEFORE_JSON.toString())))
            .andExpect(jsonPath("$.[*].afterJson").value(hasItem(DEFAULT_AFTER_JSON.toString())))
            .andExpect(jsonPath("$.[*].ipAddress").value(hasItem(DEFAULT_IP_ADDRESS)))
            .andExpect(jsonPath("$.[*].userAgent").value(hasItem(DEFAULT_USER_AGENT)))
            .andExpect(jsonPath("$.[*].performedByLogin").value(hasItem(DEFAULT_PERFORMED_BY_LOGIN)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))));
    }

    @Test
    @Transactional
    void getAuditLog() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get the auditLog
        restAuditLogMockMvc
            .perform(get(ENTITY_API_URL_ID, auditLog.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(auditLog.getId().intValue()))
            .andExpect(jsonPath("$.tenantId").value(DEFAULT_TENANT_ID.intValue()))
            .andExpect(jsonPath("$.entityType").value(DEFAULT_ENTITY_TYPE))
            .andExpect(jsonPath("$.entityId").value(DEFAULT_ENTITY_ID))
            .andExpect(jsonPath("$.action").value(DEFAULT_ACTION.toString()))
            .andExpect(jsonPath("$.beforeJson").value(DEFAULT_BEFORE_JSON.toString()))
            .andExpect(jsonPath("$.afterJson").value(DEFAULT_AFTER_JSON.toString()))
            .andExpect(jsonPath("$.ipAddress").value(DEFAULT_IP_ADDRESS))
            .andExpect(jsonPath("$.userAgent").value(DEFAULT_USER_AGENT))
            .andExpect(jsonPath("$.performedByLogin").value(DEFAULT_PERFORMED_BY_LOGIN))
            .andExpect(jsonPath("$.createdAt").value(sameInstant(DEFAULT_CREATED_AT)));
    }

    @Test
    @Transactional
    void getAuditLogsByIdFiltering() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        Long id = auditLog.getId();

        defaultAuditLogShouldBeFound("id.equals=" + id);
        defaultAuditLogShouldNotBeFound("id.notEquals=" + id);

        defaultAuditLogShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultAuditLogShouldNotBeFound("id.greaterThan=" + id);

        defaultAuditLogShouldBeFound("id.lessThanOrEqual=" + id);
        defaultAuditLogShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId equals to DEFAULT_TENANT_ID
        defaultAuditLogShouldBeFound("tenantId.equals=" + DEFAULT_TENANT_ID);

        // Get all the auditLogList where tenantId equals to UPDATED_TENANT_ID
        defaultAuditLogShouldNotBeFound("tenantId.equals=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId in DEFAULT_TENANT_ID or UPDATED_TENANT_ID
        defaultAuditLogShouldBeFound("tenantId.in=" + DEFAULT_TENANT_ID + "," + UPDATED_TENANT_ID);

        // Get all the auditLogList where tenantId equals to UPDATED_TENANT_ID
        defaultAuditLogShouldNotBeFound("tenantId.in=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId is not null
        defaultAuditLogShouldBeFound("tenantId.specified=true");

        // Get all the auditLogList where tenantId is null
        defaultAuditLogShouldNotBeFound("tenantId.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId is greater than or equal to DEFAULT_TENANT_ID
        defaultAuditLogShouldBeFound("tenantId.greaterThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the auditLogList where tenantId is greater than or equal to UPDATED_TENANT_ID
        defaultAuditLogShouldNotBeFound("tenantId.greaterThanOrEqual=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId is less than or equal to DEFAULT_TENANT_ID
        defaultAuditLogShouldBeFound("tenantId.lessThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the auditLogList where tenantId is less than or equal to SMALLER_TENANT_ID
        defaultAuditLogShouldNotBeFound("tenantId.lessThanOrEqual=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsLessThanSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId is less than DEFAULT_TENANT_ID
        defaultAuditLogShouldNotBeFound("tenantId.lessThan=" + DEFAULT_TENANT_ID);

        // Get all the auditLogList where tenantId is less than UPDATED_TENANT_ID
        defaultAuditLogShouldBeFound("tenantId.lessThan=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByTenantIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where tenantId is greater than DEFAULT_TENANT_ID
        defaultAuditLogShouldNotBeFound("tenantId.greaterThan=" + DEFAULT_TENANT_ID);

        // Get all the auditLogList where tenantId is greater than SMALLER_TENANT_ID
        defaultAuditLogShouldBeFound("tenantId.greaterThan=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityType equals to DEFAULT_ENTITY_TYPE
        defaultAuditLogShouldBeFound("entityType.equals=" + DEFAULT_ENTITY_TYPE);

        // Get all the auditLogList where entityType equals to UPDATED_ENTITY_TYPE
        defaultAuditLogShouldNotBeFound("entityType.equals=" + UPDATED_ENTITY_TYPE);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityTypeIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityType in DEFAULT_ENTITY_TYPE or UPDATED_ENTITY_TYPE
        defaultAuditLogShouldBeFound("entityType.in=" + DEFAULT_ENTITY_TYPE + "," + UPDATED_ENTITY_TYPE);

        // Get all the auditLogList where entityType equals to UPDATED_ENTITY_TYPE
        defaultAuditLogShouldNotBeFound("entityType.in=" + UPDATED_ENTITY_TYPE);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityType is not null
        defaultAuditLogShouldBeFound("entityType.specified=true");

        // Get all the auditLogList where entityType is null
        defaultAuditLogShouldNotBeFound("entityType.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityTypeContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityType contains DEFAULT_ENTITY_TYPE
        defaultAuditLogShouldBeFound("entityType.contains=" + DEFAULT_ENTITY_TYPE);

        // Get all the auditLogList where entityType contains UPDATED_ENTITY_TYPE
        defaultAuditLogShouldNotBeFound("entityType.contains=" + UPDATED_ENTITY_TYPE);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityTypeNotContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityType does not contain DEFAULT_ENTITY_TYPE
        defaultAuditLogShouldNotBeFound("entityType.doesNotContain=" + DEFAULT_ENTITY_TYPE);

        // Get all the auditLogList where entityType does not contain UPDATED_ENTITY_TYPE
        defaultAuditLogShouldBeFound("entityType.doesNotContain=" + UPDATED_ENTITY_TYPE);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityIdIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityId equals to DEFAULT_ENTITY_ID
        defaultAuditLogShouldBeFound("entityId.equals=" + DEFAULT_ENTITY_ID);

        // Get all the auditLogList where entityId equals to UPDATED_ENTITY_ID
        defaultAuditLogShouldNotBeFound("entityId.equals=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityIdIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityId in DEFAULT_ENTITY_ID or UPDATED_ENTITY_ID
        defaultAuditLogShouldBeFound("entityId.in=" + DEFAULT_ENTITY_ID + "," + UPDATED_ENTITY_ID);

        // Get all the auditLogList where entityId equals to UPDATED_ENTITY_ID
        defaultAuditLogShouldNotBeFound("entityId.in=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityId is not null
        defaultAuditLogShouldBeFound("entityId.specified=true");

        // Get all the auditLogList where entityId is null
        defaultAuditLogShouldNotBeFound("entityId.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityIdContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityId contains DEFAULT_ENTITY_ID
        defaultAuditLogShouldBeFound("entityId.contains=" + DEFAULT_ENTITY_ID);

        // Get all the auditLogList where entityId contains UPDATED_ENTITY_ID
        defaultAuditLogShouldNotBeFound("entityId.contains=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByEntityIdNotContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where entityId does not contain DEFAULT_ENTITY_ID
        defaultAuditLogShouldNotBeFound("entityId.doesNotContain=" + DEFAULT_ENTITY_ID);

        // Get all the auditLogList where entityId does not contain UPDATED_ENTITY_ID
        defaultAuditLogShouldBeFound("entityId.doesNotContain=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllAuditLogsByActionIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where action equals to DEFAULT_ACTION
        defaultAuditLogShouldBeFound("action.equals=" + DEFAULT_ACTION);

        // Get all the auditLogList where action equals to UPDATED_ACTION
        defaultAuditLogShouldNotBeFound("action.equals=" + UPDATED_ACTION);
    }

    @Test
    @Transactional
    void getAllAuditLogsByActionIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where action in DEFAULT_ACTION or UPDATED_ACTION
        defaultAuditLogShouldBeFound("action.in=" + DEFAULT_ACTION + "," + UPDATED_ACTION);

        // Get all the auditLogList where action equals to UPDATED_ACTION
        defaultAuditLogShouldNotBeFound("action.in=" + UPDATED_ACTION);
    }

    @Test
    @Transactional
    void getAllAuditLogsByActionIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where action is not null
        defaultAuditLogShouldBeFound("action.specified=true");

        // Get all the auditLogList where action is null
        defaultAuditLogShouldNotBeFound("action.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByIpAddressIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where ipAddress equals to DEFAULT_IP_ADDRESS
        defaultAuditLogShouldBeFound("ipAddress.equals=" + DEFAULT_IP_ADDRESS);

        // Get all the auditLogList where ipAddress equals to UPDATED_IP_ADDRESS
        defaultAuditLogShouldNotBeFound("ipAddress.equals=" + UPDATED_IP_ADDRESS);
    }

    @Test
    @Transactional
    void getAllAuditLogsByIpAddressIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where ipAddress in DEFAULT_IP_ADDRESS or UPDATED_IP_ADDRESS
        defaultAuditLogShouldBeFound("ipAddress.in=" + DEFAULT_IP_ADDRESS + "," + UPDATED_IP_ADDRESS);

        // Get all the auditLogList where ipAddress equals to UPDATED_IP_ADDRESS
        defaultAuditLogShouldNotBeFound("ipAddress.in=" + UPDATED_IP_ADDRESS);
    }

    @Test
    @Transactional
    void getAllAuditLogsByIpAddressIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where ipAddress is not null
        defaultAuditLogShouldBeFound("ipAddress.specified=true");

        // Get all the auditLogList where ipAddress is null
        defaultAuditLogShouldNotBeFound("ipAddress.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByIpAddressContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where ipAddress contains DEFAULT_IP_ADDRESS
        defaultAuditLogShouldBeFound("ipAddress.contains=" + DEFAULT_IP_ADDRESS);

        // Get all the auditLogList where ipAddress contains UPDATED_IP_ADDRESS
        defaultAuditLogShouldNotBeFound("ipAddress.contains=" + UPDATED_IP_ADDRESS);
    }

    @Test
    @Transactional
    void getAllAuditLogsByIpAddressNotContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where ipAddress does not contain DEFAULT_IP_ADDRESS
        defaultAuditLogShouldNotBeFound("ipAddress.doesNotContain=" + DEFAULT_IP_ADDRESS);

        // Get all the auditLogList where ipAddress does not contain UPDATED_IP_ADDRESS
        defaultAuditLogShouldBeFound("ipAddress.doesNotContain=" + UPDATED_IP_ADDRESS);
    }

    @Test
    @Transactional
    void getAllAuditLogsByUserAgentIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where userAgent equals to DEFAULT_USER_AGENT
        defaultAuditLogShouldBeFound("userAgent.equals=" + DEFAULT_USER_AGENT);

        // Get all the auditLogList where userAgent equals to UPDATED_USER_AGENT
        defaultAuditLogShouldNotBeFound("userAgent.equals=" + UPDATED_USER_AGENT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByUserAgentIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where userAgent in DEFAULT_USER_AGENT or UPDATED_USER_AGENT
        defaultAuditLogShouldBeFound("userAgent.in=" + DEFAULT_USER_AGENT + "," + UPDATED_USER_AGENT);

        // Get all the auditLogList where userAgent equals to UPDATED_USER_AGENT
        defaultAuditLogShouldNotBeFound("userAgent.in=" + UPDATED_USER_AGENT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByUserAgentIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where userAgent is not null
        defaultAuditLogShouldBeFound("userAgent.specified=true");

        // Get all the auditLogList where userAgent is null
        defaultAuditLogShouldNotBeFound("userAgent.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByUserAgentContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where userAgent contains DEFAULT_USER_AGENT
        defaultAuditLogShouldBeFound("userAgent.contains=" + DEFAULT_USER_AGENT);

        // Get all the auditLogList where userAgent contains UPDATED_USER_AGENT
        defaultAuditLogShouldNotBeFound("userAgent.contains=" + UPDATED_USER_AGENT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByUserAgentNotContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where userAgent does not contain DEFAULT_USER_AGENT
        defaultAuditLogShouldNotBeFound("userAgent.doesNotContain=" + DEFAULT_USER_AGENT);

        // Get all the auditLogList where userAgent does not contain UPDATED_USER_AGENT
        defaultAuditLogShouldBeFound("userAgent.doesNotContain=" + UPDATED_USER_AGENT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByPerformedByLoginIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where performedByLogin equals to DEFAULT_PERFORMED_BY_LOGIN
        defaultAuditLogShouldBeFound("performedByLogin.equals=" + DEFAULT_PERFORMED_BY_LOGIN);

        // Get all the auditLogList where performedByLogin equals to UPDATED_PERFORMED_BY_LOGIN
        defaultAuditLogShouldNotBeFound("performedByLogin.equals=" + UPDATED_PERFORMED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllAuditLogsByPerformedByLoginIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where performedByLogin in DEFAULT_PERFORMED_BY_LOGIN or UPDATED_PERFORMED_BY_LOGIN
        defaultAuditLogShouldBeFound("performedByLogin.in=" + DEFAULT_PERFORMED_BY_LOGIN + "," + UPDATED_PERFORMED_BY_LOGIN);

        // Get all the auditLogList where performedByLogin equals to UPDATED_PERFORMED_BY_LOGIN
        defaultAuditLogShouldNotBeFound("performedByLogin.in=" + UPDATED_PERFORMED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllAuditLogsByPerformedByLoginIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where performedByLogin is not null
        defaultAuditLogShouldBeFound("performedByLogin.specified=true");

        // Get all the auditLogList where performedByLogin is null
        defaultAuditLogShouldNotBeFound("performedByLogin.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByPerformedByLoginContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where performedByLogin contains DEFAULT_PERFORMED_BY_LOGIN
        defaultAuditLogShouldBeFound("performedByLogin.contains=" + DEFAULT_PERFORMED_BY_LOGIN);

        // Get all the auditLogList where performedByLogin contains UPDATED_PERFORMED_BY_LOGIN
        defaultAuditLogShouldNotBeFound("performedByLogin.contains=" + UPDATED_PERFORMED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllAuditLogsByPerformedByLoginNotContainsSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where performedByLogin does not contain DEFAULT_PERFORMED_BY_LOGIN
        defaultAuditLogShouldNotBeFound("performedByLogin.doesNotContain=" + DEFAULT_PERFORMED_BY_LOGIN);

        // Get all the auditLogList where performedByLogin does not contain UPDATED_PERFORMED_BY_LOGIN
        defaultAuditLogShouldBeFound("performedByLogin.doesNotContain=" + UPDATED_PERFORMED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt equals to DEFAULT_CREATED_AT
        defaultAuditLogShouldBeFound("createdAt.equals=" + DEFAULT_CREATED_AT);

        // Get all the auditLogList where createdAt equals to UPDATED_CREATED_AT
        defaultAuditLogShouldNotBeFound("createdAt.equals=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt in DEFAULT_CREATED_AT or UPDATED_CREATED_AT
        defaultAuditLogShouldBeFound("createdAt.in=" + DEFAULT_CREATED_AT + "," + UPDATED_CREATED_AT);

        // Get all the auditLogList where createdAt equals to UPDATED_CREATED_AT
        defaultAuditLogShouldNotBeFound("createdAt.in=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt is not null
        defaultAuditLogShouldBeFound("createdAt.specified=true");

        // Get all the auditLogList where createdAt is null
        defaultAuditLogShouldNotBeFound("createdAt.specified=false");
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt is greater than or equal to DEFAULT_CREATED_AT
        defaultAuditLogShouldBeFound("createdAt.greaterThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the auditLogList where createdAt is greater than or equal to UPDATED_CREATED_AT
        defaultAuditLogShouldNotBeFound("createdAt.greaterThanOrEqual=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt is less than or equal to DEFAULT_CREATED_AT
        defaultAuditLogShouldBeFound("createdAt.lessThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the auditLogList where createdAt is less than or equal to SMALLER_CREATED_AT
        defaultAuditLogShouldNotBeFound("createdAt.lessThanOrEqual=" + SMALLER_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt is less than DEFAULT_CREATED_AT
        defaultAuditLogShouldNotBeFound("createdAt.lessThan=" + DEFAULT_CREATED_AT);

        // Get all the auditLogList where createdAt is less than UPDATED_CREATED_AT
        defaultAuditLogShouldBeFound("createdAt.lessThan=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllAuditLogsByCreatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        // Get all the auditLogList where createdAt is greater than DEFAULT_CREATED_AT
        defaultAuditLogShouldNotBeFound("createdAt.greaterThan=" + DEFAULT_CREATED_AT);

        // Get all the auditLogList where createdAt is greater than SMALLER_CREATED_AT
        defaultAuditLogShouldBeFound("createdAt.greaterThan=" + SMALLER_CREATED_AT);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultAuditLogShouldBeFound(String filter) throws Exception {
        restAuditLogMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(auditLog.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].entityType").value(hasItem(DEFAULT_ENTITY_TYPE)))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID)))
            .andExpect(jsonPath("$.[*].action").value(hasItem(DEFAULT_ACTION.toString())))
            .andExpect(jsonPath("$.[*].beforeJson").value(hasItem(DEFAULT_BEFORE_JSON.toString())))
            .andExpect(jsonPath("$.[*].afterJson").value(hasItem(DEFAULT_AFTER_JSON.toString())))
            .andExpect(jsonPath("$.[*].ipAddress").value(hasItem(DEFAULT_IP_ADDRESS)))
            .andExpect(jsonPath("$.[*].userAgent").value(hasItem(DEFAULT_USER_AGENT)))
            .andExpect(jsonPath("$.[*].performedByLogin").value(hasItem(DEFAULT_PERFORMED_BY_LOGIN)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))));

        // Check, that the count call also returns 1
        restAuditLogMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultAuditLogShouldNotBeFound(String filter) throws Exception {
        restAuditLogMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restAuditLogMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingAuditLog() throws Exception {
        // Get the auditLog
        restAuditLogMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAuditLog() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();

        // Update the auditLog
        AuditLog updatedAuditLog = auditLogRepository.findById(auditLog.getId()).get();
        // Disconnect from session so that the updates on updatedAuditLog are not directly saved in db
        em.detach(updatedAuditLog);
        updatedAuditLog
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .entityId(UPDATED_ENTITY_ID)
            .action(UPDATED_ACTION)
            .beforeJson(UPDATED_BEFORE_JSON)
            .afterJson(UPDATED_AFTER_JSON)
            .ipAddress(UPDATED_IP_ADDRESS)
            .userAgent(UPDATED_USER_AGENT)
            .performedByLogin(UPDATED_PERFORMED_BY_LOGIN)
            .createdAt(UPDATED_CREATED_AT);
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(updatedAuditLog);

        restAuditLogMockMvc
            .perform(
                put(ENTITY_API_URL_ID, auditLogDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(auditLogDTO))
            )
            .andExpect(status().isOk());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
        AuditLog testAuditLog = auditLogList.get(auditLogList.size() - 1);
        assertThat(testAuditLog.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testAuditLog.getEntityType()).isEqualTo(UPDATED_ENTITY_TYPE);
        assertThat(testAuditLog.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
        assertThat(testAuditLog.getAction()).isEqualTo(UPDATED_ACTION);
        assertThat(testAuditLog.getBeforeJson()).isEqualTo(UPDATED_BEFORE_JSON);
        assertThat(testAuditLog.getAfterJson()).isEqualTo(UPDATED_AFTER_JSON);
        assertThat(testAuditLog.getIpAddress()).isEqualTo(UPDATED_IP_ADDRESS);
        assertThat(testAuditLog.getUserAgent()).isEqualTo(UPDATED_USER_AGENT);
        assertThat(testAuditLog.getPerformedByLogin()).isEqualTo(UPDATED_PERFORMED_BY_LOGIN);
        assertThat(testAuditLog.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void putNonExistingAuditLog() throws Exception {
        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();
        auditLog.setId(count.incrementAndGet());

        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAuditLogMockMvc
            .perform(
                put(ENTITY_API_URL_ID, auditLogDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(auditLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAuditLog() throws Exception {
        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();
        auditLog.setId(count.incrementAndGet());

        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAuditLogMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(auditLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAuditLog() throws Exception {
        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();
        auditLog.setId(count.incrementAndGet());

        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAuditLogMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(auditLogDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAuditLogWithPatch() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();

        // Update the auditLog using partial update
        AuditLog partialUpdatedAuditLog = new AuditLog();
        partialUpdatedAuditLog.setId(auditLog.getId());

        partialUpdatedAuditLog
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .action(UPDATED_ACTION)
            .userAgent(UPDATED_USER_AGENT)
            .performedByLogin(UPDATED_PERFORMED_BY_LOGIN);

        restAuditLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAuditLog.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAuditLog))
            )
            .andExpect(status().isOk());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
        AuditLog testAuditLog = auditLogList.get(auditLogList.size() - 1);
        assertThat(testAuditLog.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testAuditLog.getEntityType()).isEqualTo(UPDATED_ENTITY_TYPE);
        assertThat(testAuditLog.getEntityId()).isEqualTo(DEFAULT_ENTITY_ID);
        assertThat(testAuditLog.getAction()).isEqualTo(UPDATED_ACTION);
        assertThat(testAuditLog.getBeforeJson()).isEqualTo(DEFAULT_BEFORE_JSON);
        assertThat(testAuditLog.getAfterJson()).isEqualTo(DEFAULT_AFTER_JSON);
        assertThat(testAuditLog.getIpAddress()).isEqualTo(DEFAULT_IP_ADDRESS);
        assertThat(testAuditLog.getUserAgent()).isEqualTo(UPDATED_USER_AGENT);
        assertThat(testAuditLog.getPerformedByLogin()).isEqualTo(UPDATED_PERFORMED_BY_LOGIN);
        assertThat(testAuditLog.getCreatedAt()).isEqualTo(DEFAULT_CREATED_AT);
    }

    @Test
    @Transactional
    void fullUpdateAuditLogWithPatch() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();

        // Update the auditLog using partial update
        AuditLog partialUpdatedAuditLog = new AuditLog();
        partialUpdatedAuditLog.setId(auditLog.getId());

        partialUpdatedAuditLog
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .entityId(UPDATED_ENTITY_ID)
            .action(UPDATED_ACTION)
            .beforeJson(UPDATED_BEFORE_JSON)
            .afterJson(UPDATED_AFTER_JSON)
            .ipAddress(UPDATED_IP_ADDRESS)
            .userAgent(UPDATED_USER_AGENT)
            .performedByLogin(UPDATED_PERFORMED_BY_LOGIN)
            .createdAt(UPDATED_CREATED_AT);

        restAuditLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAuditLog.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAuditLog))
            )
            .andExpect(status().isOk());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
        AuditLog testAuditLog = auditLogList.get(auditLogList.size() - 1);
        assertThat(testAuditLog.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testAuditLog.getEntityType()).isEqualTo(UPDATED_ENTITY_TYPE);
        assertThat(testAuditLog.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
        assertThat(testAuditLog.getAction()).isEqualTo(UPDATED_ACTION);
        assertThat(testAuditLog.getBeforeJson()).isEqualTo(UPDATED_BEFORE_JSON);
        assertThat(testAuditLog.getAfterJson()).isEqualTo(UPDATED_AFTER_JSON);
        assertThat(testAuditLog.getIpAddress()).isEqualTo(UPDATED_IP_ADDRESS);
        assertThat(testAuditLog.getUserAgent()).isEqualTo(UPDATED_USER_AGENT);
        assertThat(testAuditLog.getPerformedByLogin()).isEqualTo(UPDATED_PERFORMED_BY_LOGIN);
        assertThat(testAuditLog.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void patchNonExistingAuditLog() throws Exception {
        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();
        auditLog.setId(count.incrementAndGet());

        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAuditLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, auditLogDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(auditLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAuditLog() throws Exception {
        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();
        auditLog.setId(count.incrementAndGet());

        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAuditLogMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(auditLogDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAuditLog() throws Exception {
        int databaseSizeBeforeUpdate = auditLogRepository.findAll().size();
        auditLog.setId(count.incrementAndGet());

        // Create the AuditLog
        AuditLogDTO auditLogDTO = auditLogMapper.toDto(auditLog);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAuditLogMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(auditLogDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AuditLog in the database
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAuditLog() throws Exception {
        // Initialize the database
        auditLogRepository.saveAndFlush(auditLog);

        int databaseSizeBeforeDelete = auditLogRepository.findAll().size();

        // Delete the auditLog
        restAuditLogMockMvc
            .perform(delete(ENTITY_API_URL_ID, auditLog.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<AuditLog> auditLogList = auditLogRepository.findAll();
        assertThat(auditLogList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
