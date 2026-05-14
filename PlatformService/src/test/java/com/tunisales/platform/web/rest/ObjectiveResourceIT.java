package com.tunisales.platform.web.rest;

import static com.tunisales.platform.web.rest.TestUtil.sameInstant;
import static com.tunisales.platform.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tunisales.platform.IntegrationTest;
import com.tunisales.platform.domain.Objective;
import com.tunisales.platform.domain.enumeration.MetricType;
import com.tunisales.platform.repository.ObjectiveRepository;
import com.tunisales.platform.service.criteria.ObjectiveCriteria;
import com.tunisales.platform.service.dto.ObjectiveDTO;
import com.tunisales.platform.service.mapper.ObjectiveMapper;
import java.math.BigDecimal;
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

/**
 * Integration tests for the {@link ObjectiveResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ObjectiveResourceIT {

    private static final Long DEFAULT_TENANT_ID = 1L;
    private static final Long UPDATED_TENANT_ID = 2L;
    private static final Long SMALLER_TENANT_ID = 1L - 1L;

    private static final String DEFAULT_ASSIGNED_TO_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_ASSIGNED_TO_LOGIN = "BBBBBBBBBB";

    private static final String DEFAULT_PERIOD = "AAAAAAA";
    private static final String UPDATED_PERIOD = "BBBBBBB";

    private static final MetricType DEFAULT_METRIC_TYPE = MetricType.REVENUE;
    private static final MetricType UPDATED_METRIC_TYPE = MetricType.UNIT_VOLUME;

    private static final BigDecimal DEFAULT_TARGET_VALUE = new BigDecimal(0);
    private static final BigDecimal UPDATED_TARGET_VALUE = new BigDecimal(1);
    private static final BigDecimal SMALLER_TARGET_VALUE = new BigDecimal(0 - 1);

    private static final BigDecimal DEFAULT_ACHIEVED_VALUE = new BigDecimal(0);
    private static final BigDecimal UPDATED_ACHIEVED_VALUE = new BigDecimal(1);
    private static final BigDecimal SMALLER_ACHIEVED_VALUE = new BigDecimal(0 - 1);

    private static final ZonedDateTime DEFAULT_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final ZonedDateTime DEFAULT_UPDATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_UPDATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_UPDATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final String ENTITY_API_URL = "/api/objectives";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectiveRepository objectiveRepository;

    @Autowired
    private ObjectiveMapper objectiveMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restObjectiveMockMvc;

    private Objective objective;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Objective createEntity(EntityManager em) {
        Objective objective = new Objective()
            .tenantId(DEFAULT_TENANT_ID)
            .assignedToLogin(DEFAULT_ASSIGNED_TO_LOGIN)
            .period(DEFAULT_PERIOD)
            .metricType(DEFAULT_METRIC_TYPE)
            .targetValue(DEFAULT_TARGET_VALUE)
            .achievedValue(DEFAULT_ACHIEVED_VALUE)
            .createdAt(DEFAULT_CREATED_AT)
            .updatedAt(DEFAULT_UPDATED_AT);
        return objective;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Objective createUpdatedEntity(EntityManager em) {
        Objective objective = new Objective()
            .tenantId(UPDATED_TENANT_ID)
            .assignedToLogin(UPDATED_ASSIGNED_TO_LOGIN)
            .period(UPDATED_PERIOD)
            .metricType(UPDATED_METRIC_TYPE)
            .targetValue(UPDATED_TARGET_VALUE)
            .achievedValue(UPDATED_ACHIEVED_VALUE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        return objective;
    }

    @BeforeEach
    public void initTest() {
        objective = createEntity(em);
    }

    @Test
    @Transactional
    void createObjective() throws Exception {
        int databaseSizeBeforeCreate = objectiveRepository.findAll().size();
        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);
        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isCreated());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeCreate + 1);
        Objective testObjective = objectiveList.get(objectiveList.size() - 1);
        assertThat(testObjective.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testObjective.getAssignedToLogin()).isEqualTo(DEFAULT_ASSIGNED_TO_LOGIN);
        assertThat(testObjective.getPeriod()).isEqualTo(DEFAULT_PERIOD);
        assertThat(testObjective.getMetricType()).isEqualTo(DEFAULT_METRIC_TYPE);
        assertThat(testObjective.getTargetValue()).isEqualByComparingTo(DEFAULT_TARGET_VALUE);
        assertThat(testObjective.getAchievedValue()).isEqualByComparingTo(DEFAULT_ACHIEVED_VALUE);
        assertThat(testObjective.getCreatedAt()).isEqualTo(DEFAULT_CREATED_AT);
        assertThat(testObjective.getUpdatedAt()).isEqualTo(DEFAULT_UPDATED_AT);
    }

    @Test
    @Transactional
    void createObjectiveWithExistingId() throws Exception {
        // Create the Objective with an existing ID
        objective.setId(1L);
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        int databaseSizeBeforeCreate = objectiveRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTenantIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = objectiveRepository.findAll().size();
        // set the field null
        objective.setTenantId(null);

        // Create the Objective, which fails.
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAssignedToLoginIsRequired() throws Exception {
        int databaseSizeBeforeTest = objectiveRepository.findAll().size();
        // set the field null
        objective.setAssignedToLogin(null);

        // Create the Objective, which fails.
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPeriodIsRequired() throws Exception {
        int databaseSizeBeforeTest = objectiveRepository.findAll().size();
        // set the field null
        objective.setPeriod(null);

        // Create the Objective, which fails.
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMetricTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = objectiveRepository.findAll().size();
        // set the field null
        objective.setMetricType(null);

        // Create the Objective, which fails.
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTargetValueIsRequired() throws Exception {
        int databaseSizeBeforeTest = objectiveRepository.findAll().size();
        // set the field null
        objective.setTargetValue(null);

        // Create the Objective, which fails.
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        int databaseSizeBeforeTest = objectiveRepository.findAll().size();
        // set the field null
        objective.setCreatedAt(null);

        // Create the Objective, which fails.
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        restObjectiveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isBadRequest());

        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllObjectives() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList
        restObjectiveMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(objective.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].assignedToLogin").value(hasItem(DEFAULT_ASSIGNED_TO_LOGIN)))
            .andExpect(jsonPath("$.[*].period").value(hasItem(DEFAULT_PERIOD)))
            .andExpect(jsonPath("$.[*].metricType").value(hasItem(DEFAULT_METRIC_TYPE.toString())))
            .andExpect(jsonPath("$.[*].targetValue").value(hasItem(sameNumber(DEFAULT_TARGET_VALUE))))
            .andExpect(jsonPath("$.[*].achievedValue").value(hasItem(sameNumber(DEFAULT_ACHIEVED_VALUE))))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))))
            .andExpect(jsonPath("$.[*].updatedAt").value(hasItem(sameInstant(DEFAULT_UPDATED_AT))));
    }

    @Test
    @Transactional
    void getObjective() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get the objective
        restObjectiveMockMvc
            .perform(get(ENTITY_API_URL_ID, objective.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(objective.getId().intValue()))
            .andExpect(jsonPath("$.tenantId").value(DEFAULT_TENANT_ID.intValue()))
            .andExpect(jsonPath("$.assignedToLogin").value(DEFAULT_ASSIGNED_TO_LOGIN))
            .andExpect(jsonPath("$.period").value(DEFAULT_PERIOD))
            .andExpect(jsonPath("$.metricType").value(DEFAULT_METRIC_TYPE.toString()))
            .andExpect(jsonPath("$.targetValue").value(sameNumber(DEFAULT_TARGET_VALUE)))
            .andExpect(jsonPath("$.achievedValue").value(sameNumber(DEFAULT_ACHIEVED_VALUE)))
            .andExpect(jsonPath("$.createdAt").value(sameInstant(DEFAULT_CREATED_AT)))
            .andExpect(jsonPath("$.updatedAt").value(sameInstant(DEFAULT_UPDATED_AT)));
    }

    @Test
    @Transactional
    void getObjectivesByIdFiltering() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        Long id = objective.getId();

        defaultObjectiveShouldBeFound("id.equals=" + id);
        defaultObjectiveShouldNotBeFound("id.notEquals=" + id);

        defaultObjectiveShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultObjectiveShouldNotBeFound("id.greaterThan=" + id);

        defaultObjectiveShouldBeFound("id.lessThanOrEqual=" + id);
        defaultObjectiveShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId equals to DEFAULT_TENANT_ID
        defaultObjectiveShouldBeFound("tenantId.equals=" + DEFAULT_TENANT_ID);

        // Get all the objectiveList where tenantId equals to UPDATED_TENANT_ID
        defaultObjectiveShouldNotBeFound("tenantId.equals=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId in DEFAULT_TENANT_ID or UPDATED_TENANT_ID
        defaultObjectiveShouldBeFound("tenantId.in=" + DEFAULT_TENANT_ID + "," + UPDATED_TENANT_ID);

        // Get all the objectiveList where tenantId equals to UPDATED_TENANT_ID
        defaultObjectiveShouldNotBeFound("tenantId.in=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId is not null
        defaultObjectiveShouldBeFound("tenantId.specified=true");

        // Get all the objectiveList where tenantId is null
        defaultObjectiveShouldNotBeFound("tenantId.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId is greater than or equal to DEFAULT_TENANT_ID
        defaultObjectiveShouldBeFound("tenantId.greaterThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the objectiveList where tenantId is greater than or equal to UPDATED_TENANT_ID
        defaultObjectiveShouldNotBeFound("tenantId.greaterThanOrEqual=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId is less than or equal to DEFAULT_TENANT_ID
        defaultObjectiveShouldBeFound("tenantId.lessThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the objectiveList where tenantId is less than or equal to SMALLER_TENANT_ID
        defaultObjectiveShouldNotBeFound("tenantId.lessThanOrEqual=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsLessThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId is less than DEFAULT_TENANT_ID
        defaultObjectiveShouldNotBeFound("tenantId.lessThan=" + DEFAULT_TENANT_ID);

        // Get all the objectiveList where tenantId is less than UPDATED_TENANT_ID
        defaultObjectiveShouldBeFound("tenantId.lessThan=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllObjectivesByTenantIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where tenantId is greater than DEFAULT_TENANT_ID
        defaultObjectiveShouldNotBeFound("tenantId.greaterThan=" + DEFAULT_TENANT_ID);

        // Get all the objectiveList where tenantId is greater than SMALLER_TENANT_ID
        defaultObjectiveShouldBeFound("tenantId.greaterThan=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllObjectivesByAssignedToLoginIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where assignedToLogin equals to DEFAULT_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldBeFound("assignedToLogin.equals=" + DEFAULT_ASSIGNED_TO_LOGIN);

        // Get all the objectiveList where assignedToLogin equals to UPDATED_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldNotBeFound("assignedToLogin.equals=" + UPDATED_ASSIGNED_TO_LOGIN);
    }

    @Test
    @Transactional
    void getAllObjectivesByAssignedToLoginIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where assignedToLogin in DEFAULT_ASSIGNED_TO_LOGIN or UPDATED_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldBeFound("assignedToLogin.in=" + DEFAULT_ASSIGNED_TO_LOGIN + "," + UPDATED_ASSIGNED_TO_LOGIN);

        // Get all the objectiveList where assignedToLogin equals to UPDATED_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldNotBeFound("assignedToLogin.in=" + UPDATED_ASSIGNED_TO_LOGIN);
    }

    @Test
    @Transactional
    void getAllObjectivesByAssignedToLoginIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where assignedToLogin is not null
        defaultObjectiveShouldBeFound("assignedToLogin.specified=true");

        // Get all the objectiveList where assignedToLogin is null
        defaultObjectiveShouldNotBeFound("assignedToLogin.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByAssignedToLoginContainsSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where assignedToLogin contains DEFAULT_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldBeFound("assignedToLogin.contains=" + DEFAULT_ASSIGNED_TO_LOGIN);

        // Get all the objectiveList where assignedToLogin contains UPDATED_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldNotBeFound("assignedToLogin.contains=" + UPDATED_ASSIGNED_TO_LOGIN);
    }

    @Test
    @Transactional
    void getAllObjectivesByAssignedToLoginNotContainsSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where assignedToLogin does not contain DEFAULT_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldNotBeFound("assignedToLogin.doesNotContain=" + DEFAULT_ASSIGNED_TO_LOGIN);

        // Get all the objectiveList where assignedToLogin does not contain UPDATED_ASSIGNED_TO_LOGIN
        defaultObjectiveShouldBeFound("assignedToLogin.doesNotContain=" + UPDATED_ASSIGNED_TO_LOGIN);
    }

    @Test
    @Transactional
    void getAllObjectivesByPeriodIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where period equals to DEFAULT_PERIOD
        defaultObjectiveShouldBeFound("period.equals=" + DEFAULT_PERIOD);

        // Get all the objectiveList where period equals to UPDATED_PERIOD
        defaultObjectiveShouldNotBeFound("period.equals=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllObjectivesByPeriodIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where period in DEFAULT_PERIOD or UPDATED_PERIOD
        defaultObjectiveShouldBeFound("period.in=" + DEFAULT_PERIOD + "," + UPDATED_PERIOD);

        // Get all the objectiveList where period equals to UPDATED_PERIOD
        defaultObjectiveShouldNotBeFound("period.in=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllObjectivesByPeriodIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where period is not null
        defaultObjectiveShouldBeFound("period.specified=true");

        // Get all the objectiveList where period is null
        defaultObjectiveShouldNotBeFound("period.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByPeriodContainsSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where period contains DEFAULT_PERIOD
        defaultObjectiveShouldBeFound("period.contains=" + DEFAULT_PERIOD);

        // Get all the objectiveList where period contains UPDATED_PERIOD
        defaultObjectiveShouldNotBeFound("period.contains=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllObjectivesByPeriodNotContainsSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where period does not contain DEFAULT_PERIOD
        defaultObjectiveShouldNotBeFound("period.doesNotContain=" + DEFAULT_PERIOD);

        // Get all the objectiveList where period does not contain UPDATED_PERIOD
        defaultObjectiveShouldBeFound("period.doesNotContain=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllObjectivesByMetricTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where metricType equals to DEFAULT_METRIC_TYPE
        defaultObjectiveShouldBeFound("metricType.equals=" + DEFAULT_METRIC_TYPE);

        // Get all the objectiveList where metricType equals to UPDATED_METRIC_TYPE
        defaultObjectiveShouldNotBeFound("metricType.equals=" + UPDATED_METRIC_TYPE);
    }

    @Test
    @Transactional
    void getAllObjectivesByMetricTypeIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where metricType in DEFAULT_METRIC_TYPE or UPDATED_METRIC_TYPE
        defaultObjectiveShouldBeFound("metricType.in=" + DEFAULT_METRIC_TYPE + "," + UPDATED_METRIC_TYPE);

        // Get all the objectiveList where metricType equals to UPDATED_METRIC_TYPE
        defaultObjectiveShouldNotBeFound("metricType.in=" + UPDATED_METRIC_TYPE);
    }

    @Test
    @Transactional
    void getAllObjectivesByMetricTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where metricType is not null
        defaultObjectiveShouldBeFound("metricType.specified=true");

        // Get all the objectiveList where metricType is null
        defaultObjectiveShouldNotBeFound("metricType.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue equals to DEFAULT_TARGET_VALUE
        defaultObjectiveShouldBeFound("targetValue.equals=" + DEFAULT_TARGET_VALUE);

        // Get all the objectiveList where targetValue equals to UPDATED_TARGET_VALUE
        defaultObjectiveShouldNotBeFound("targetValue.equals=" + UPDATED_TARGET_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue in DEFAULT_TARGET_VALUE or UPDATED_TARGET_VALUE
        defaultObjectiveShouldBeFound("targetValue.in=" + DEFAULT_TARGET_VALUE + "," + UPDATED_TARGET_VALUE);

        // Get all the objectiveList where targetValue equals to UPDATED_TARGET_VALUE
        defaultObjectiveShouldNotBeFound("targetValue.in=" + UPDATED_TARGET_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue is not null
        defaultObjectiveShouldBeFound("targetValue.specified=true");

        // Get all the objectiveList where targetValue is null
        defaultObjectiveShouldNotBeFound("targetValue.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue is greater than or equal to DEFAULT_TARGET_VALUE
        defaultObjectiveShouldBeFound("targetValue.greaterThanOrEqual=" + DEFAULT_TARGET_VALUE);

        // Get all the objectiveList where targetValue is greater than or equal to UPDATED_TARGET_VALUE
        defaultObjectiveShouldNotBeFound("targetValue.greaterThanOrEqual=" + UPDATED_TARGET_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue is less than or equal to DEFAULT_TARGET_VALUE
        defaultObjectiveShouldBeFound("targetValue.lessThanOrEqual=" + DEFAULT_TARGET_VALUE);

        // Get all the objectiveList where targetValue is less than or equal to SMALLER_TARGET_VALUE
        defaultObjectiveShouldNotBeFound("targetValue.lessThanOrEqual=" + SMALLER_TARGET_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsLessThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue is less than DEFAULT_TARGET_VALUE
        defaultObjectiveShouldNotBeFound("targetValue.lessThan=" + DEFAULT_TARGET_VALUE);

        // Get all the objectiveList where targetValue is less than UPDATED_TARGET_VALUE
        defaultObjectiveShouldBeFound("targetValue.lessThan=" + UPDATED_TARGET_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByTargetValueIsGreaterThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where targetValue is greater than DEFAULT_TARGET_VALUE
        defaultObjectiveShouldNotBeFound("targetValue.greaterThan=" + DEFAULT_TARGET_VALUE);

        // Get all the objectiveList where targetValue is greater than SMALLER_TARGET_VALUE
        defaultObjectiveShouldBeFound("targetValue.greaterThan=" + SMALLER_TARGET_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue equals to DEFAULT_ACHIEVED_VALUE
        defaultObjectiveShouldBeFound("achievedValue.equals=" + DEFAULT_ACHIEVED_VALUE);

        // Get all the objectiveList where achievedValue equals to UPDATED_ACHIEVED_VALUE
        defaultObjectiveShouldNotBeFound("achievedValue.equals=" + UPDATED_ACHIEVED_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue in DEFAULT_ACHIEVED_VALUE or UPDATED_ACHIEVED_VALUE
        defaultObjectiveShouldBeFound("achievedValue.in=" + DEFAULT_ACHIEVED_VALUE + "," + UPDATED_ACHIEVED_VALUE);

        // Get all the objectiveList where achievedValue equals to UPDATED_ACHIEVED_VALUE
        defaultObjectiveShouldNotBeFound("achievedValue.in=" + UPDATED_ACHIEVED_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue is not null
        defaultObjectiveShouldBeFound("achievedValue.specified=true");

        // Get all the objectiveList where achievedValue is null
        defaultObjectiveShouldNotBeFound("achievedValue.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue is greater than or equal to DEFAULT_ACHIEVED_VALUE
        defaultObjectiveShouldBeFound("achievedValue.greaterThanOrEqual=" + DEFAULT_ACHIEVED_VALUE);

        // Get all the objectiveList where achievedValue is greater than or equal to UPDATED_ACHIEVED_VALUE
        defaultObjectiveShouldNotBeFound("achievedValue.greaterThanOrEqual=" + UPDATED_ACHIEVED_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue is less than or equal to DEFAULT_ACHIEVED_VALUE
        defaultObjectiveShouldBeFound("achievedValue.lessThanOrEqual=" + DEFAULT_ACHIEVED_VALUE);

        // Get all the objectiveList where achievedValue is less than or equal to SMALLER_ACHIEVED_VALUE
        defaultObjectiveShouldNotBeFound("achievedValue.lessThanOrEqual=" + SMALLER_ACHIEVED_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsLessThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue is less than DEFAULT_ACHIEVED_VALUE
        defaultObjectiveShouldNotBeFound("achievedValue.lessThan=" + DEFAULT_ACHIEVED_VALUE);

        // Get all the objectiveList where achievedValue is less than UPDATED_ACHIEVED_VALUE
        defaultObjectiveShouldBeFound("achievedValue.lessThan=" + UPDATED_ACHIEVED_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByAchievedValueIsGreaterThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where achievedValue is greater than DEFAULT_ACHIEVED_VALUE
        defaultObjectiveShouldNotBeFound("achievedValue.greaterThan=" + DEFAULT_ACHIEVED_VALUE);

        // Get all the objectiveList where achievedValue is greater than SMALLER_ACHIEVED_VALUE
        defaultObjectiveShouldBeFound("achievedValue.greaterThan=" + SMALLER_ACHIEVED_VALUE);
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt equals to DEFAULT_CREATED_AT
        defaultObjectiveShouldBeFound("createdAt.equals=" + DEFAULT_CREATED_AT);

        // Get all the objectiveList where createdAt equals to UPDATED_CREATED_AT
        defaultObjectiveShouldNotBeFound("createdAt.equals=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt in DEFAULT_CREATED_AT or UPDATED_CREATED_AT
        defaultObjectiveShouldBeFound("createdAt.in=" + DEFAULT_CREATED_AT + "," + UPDATED_CREATED_AT);

        // Get all the objectiveList where createdAt equals to UPDATED_CREATED_AT
        defaultObjectiveShouldNotBeFound("createdAt.in=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt is not null
        defaultObjectiveShouldBeFound("createdAt.specified=true");

        // Get all the objectiveList where createdAt is null
        defaultObjectiveShouldNotBeFound("createdAt.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt is greater than or equal to DEFAULT_CREATED_AT
        defaultObjectiveShouldBeFound("createdAt.greaterThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the objectiveList where createdAt is greater than or equal to UPDATED_CREATED_AT
        defaultObjectiveShouldNotBeFound("createdAt.greaterThanOrEqual=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt is less than or equal to DEFAULT_CREATED_AT
        defaultObjectiveShouldBeFound("createdAt.lessThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the objectiveList where createdAt is less than or equal to SMALLER_CREATED_AT
        defaultObjectiveShouldNotBeFound("createdAt.lessThanOrEqual=" + SMALLER_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt is less than DEFAULT_CREATED_AT
        defaultObjectiveShouldNotBeFound("createdAt.lessThan=" + DEFAULT_CREATED_AT);

        // Get all the objectiveList where createdAt is less than UPDATED_CREATED_AT
        defaultObjectiveShouldBeFound("createdAt.lessThan=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByCreatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where createdAt is greater than DEFAULT_CREATED_AT
        defaultObjectiveShouldNotBeFound("createdAt.greaterThan=" + DEFAULT_CREATED_AT);

        // Get all the objectiveList where createdAt is greater than SMALLER_CREATED_AT
        defaultObjectiveShouldBeFound("createdAt.greaterThan=" + SMALLER_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt equals to DEFAULT_UPDATED_AT
        defaultObjectiveShouldBeFound("updatedAt.equals=" + DEFAULT_UPDATED_AT);

        // Get all the objectiveList where updatedAt equals to UPDATED_UPDATED_AT
        defaultObjectiveShouldNotBeFound("updatedAt.equals=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt in DEFAULT_UPDATED_AT or UPDATED_UPDATED_AT
        defaultObjectiveShouldBeFound("updatedAt.in=" + DEFAULT_UPDATED_AT + "," + UPDATED_UPDATED_AT);

        // Get all the objectiveList where updatedAt equals to UPDATED_UPDATED_AT
        defaultObjectiveShouldNotBeFound("updatedAt.in=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt is not null
        defaultObjectiveShouldBeFound("updatedAt.specified=true");

        // Get all the objectiveList where updatedAt is null
        defaultObjectiveShouldNotBeFound("updatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt is greater than or equal to DEFAULT_UPDATED_AT
        defaultObjectiveShouldBeFound("updatedAt.greaterThanOrEqual=" + DEFAULT_UPDATED_AT);

        // Get all the objectiveList where updatedAt is greater than or equal to UPDATED_UPDATED_AT
        defaultObjectiveShouldNotBeFound("updatedAt.greaterThanOrEqual=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt is less than or equal to DEFAULT_UPDATED_AT
        defaultObjectiveShouldBeFound("updatedAt.lessThanOrEqual=" + DEFAULT_UPDATED_AT);

        // Get all the objectiveList where updatedAt is less than or equal to SMALLER_UPDATED_AT
        defaultObjectiveShouldNotBeFound("updatedAt.lessThanOrEqual=" + SMALLER_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt is less than DEFAULT_UPDATED_AT
        defaultObjectiveShouldNotBeFound("updatedAt.lessThan=" + DEFAULT_UPDATED_AT);

        // Get all the objectiveList where updatedAt is less than UPDATED_UPDATED_AT
        defaultObjectiveShouldBeFound("updatedAt.lessThan=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllObjectivesByUpdatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        // Get all the objectiveList where updatedAt is greater than DEFAULT_UPDATED_AT
        defaultObjectiveShouldNotBeFound("updatedAt.greaterThan=" + DEFAULT_UPDATED_AT);

        // Get all the objectiveList where updatedAt is greater than SMALLER_UPDATED_AT
        defaultObjectiveShouldBeFound("updatedAt.greaterThan=" + SMALLER_UPDATED_AT);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultObjectiveShouldBeFound(String filter) throws Exception {
        restObjectiveMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(objective.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].assignedToLogin").value(hasItem(DEFAULT_ASSIGNED_TO_LOGIN)))
            .andExpect(jsonPath("$.[*].period").value(hasItem(DEFAULT_PERIOD)))
            .andExpect(jsonPath("$.[*].metricType").value(hasItem(DEFAULT_METRIC_TYPE.toString())))
            .andExpect(jsonPath("$.[*].targetValue").value(hasItem(sameNumber(DEFAULT_TARGET_VALUE))))
            .andExpect(jsonPath("$.[*].achievedValue").value(hasItem(sameNumber(DEFAULT_ACHIEVED_VALUE))))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))))
            .andExpect(jsonPath("$.[*].updatedAt").value(hasItem(sameInstant(DEFAULT_UPDATED_AT))));

        // Check, that the count call also returns 1
        restObjectiveMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultObjectiveShouldNotBeFound(String filter) throws Exception {
        restObjectiveMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restObjectiveMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingObjective() throws Exception {
        // Get the objective
        restObjectiveMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingObjective() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();

        // Update the objective
        Objective updatedObjective = objectiveRepository.findById(objective.getId()).get();
        // Disconnect from session so that the updates on updatedObjective are not directly saved in db
        em.detach(updatedObjective);
        updatedObjective
            .tenantId(UPDATED_TENANT_ID)
            .assignedToLogin(UPDATED_ASSIGNED_TO_LOGIN)
            .period(UPDATED_PERIOD)
            .metricType(UPDATED_METRIC_TYPE)
            .targetValue(UPDATED_TARGET_VALUE)
            .achievedValue(UPDATED_ACHIEVED_VALUE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(updatedObjective);

        restObjectiveMockMvc
            .perform(
                put(ENTITY_API_URL_ID, objectiveDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(objectiveDTO))
            )
            .andExpect(status().isOk());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
        Objective testObjective = objectiveList.get(objectiveList.size() - 1);
        assertThat(testObjective.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testObjective.getAssignedToLogin()).isEqualTo(UPDATED_ASSIGNED_TO_LOGIN);
        assertThat(testObjective.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testObjective.getMetricType()).isEqualTo(UPDATED_METRIC_TYPE);
        assertThat(testObjective.getTargetValue()).isEqualByComparingTo(UPDATED_TARGET_VALUE);
        assertThat(testObjective.getAchievedValue()).isEqualByComparingTo(UPDATED_ACHIEVED_VALUE);
        assertThat(testObjective.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
        assertThat(testObjective.getUpdatedAt()).isEqualTo(UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void putNonExistingObjective() throws Exception {
        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();
        objective.setId(count.incrementAndGet());

        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restObjectiveMockMvc
            .perform(
                put(ENTITY_API_URL_ID, objectiveDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(objectiveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchObjective() throws Exception {
        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();
        objective.setId(count.incrementAndGet());

        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restObjectiveMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(objectiveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamObjective() throws Exception {
        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();
        objective.setId(count.incrementAndGet());

        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restObjectiveMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(objectiveDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateObjectiveWithPatch() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();

        // Update the objective using partial update
        Objective partialUpdatedObjective = new Objective();
        partialUpdatedObjective.setId(objective.getId());

        partialUpdatedObjective.period(UPDATED_PERIOD).achievedValue(UPDATED_ACHIEVED_VALUE).updatedAt(UPDATED_UPDATED_AT);

        restObjectiveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedObjective.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedObjective))
            )
            .andExpect(status().isOk());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
        Objective testObjective = objectiveList.get(objectiveList.size() - 1);
        assertThat(testObjective.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testObjective.getAssignedToLogin()).isEqualTo(DEFAULT_ASSIGNED_TO_LOGIN);
        assertThat(testObjective.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testObjective.getMetricType()).isEqualTo(DEFAULT_METRIC_TYPE);
        assertThat(testObjective.getTargetValue()).isEqualByComparingTo(DEFAULT_TARGET_VALUE);
        assertThat(testObjective.getAchievedValue()).isEqualByComparingTo(UPDATED_ACHIEVED_VALUE);
        assertThat(testObjective.getCreatedAt()).isEqualTo(DEFAULT_CREATED_AT);
        assertThat(testObjective.getUpdatedAt()).isEqualTo(UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void fullUpdateObjectiveWithPatch() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();

        // Update the objective using partial update
        Objective partialUpdatedObjective = new Objective();
        partialUpdatedObjective.setId(objective.getId());

        partialUpdatedObjective
            .tenantId(UPDATED_TENANT_ID)
            .assignedToLogin(UPDATED_ASSIGNED_TO_LOGIN)
            .period(UPDATED_PERIOD)
            .metricType(UPDATED_METRIC_TYPE)
            .targetValue(UPDATED_TARGET_VALUE)
            .achievedValue(UPDATED_ACHIEVED_VALUE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);

        restObjectiveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedObjective.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedObjective))
            )
            .andExpect(status().isOk());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
        Objective testObjective = objectiveList.get(objectiveList.size() - 1);
        assertThat(testObjective.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testObjective.getAssignedToLogin()).isEqualTo(UPDATED_ASSIGNED_TO_LOGIN);
        assertThat(testObjective.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testObjective.getMetricType()).isEqualTo(UPDATED_METRIC_TYPE);
        assertThat(testObjective.getTargetValue()).isEqualByComparingTo(UPDATED_TARGET_VALUE);
        assertThat(testObjective.getAchievedValue()).isEqualByComparingTo(UPDATED_ACHIEVED_VALUE);
        assertThat(testObjective.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
        assertThat(testObjective.getUpdatedAt()).isEqualTo(UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void patchNonExistingObjective() throws Exception {
        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();
        objective.setId(count.incrementAndGet());

        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restObjectiveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, objectiveDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(objectiveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchObjective() throws Exception {
        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();
        objective.setId(count.incrementAndGet());

        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restObjectiveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(objectiveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamObjective() throws Exception {
        int databaseSizeBeforeUpdate = objectiveRepository.findAll().size();
        objective.setId(count.incrementAndGet());

        // Create the Objective
        ObjectiveDTO objectiveDTO = objectiveMapper.toDto(objective);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restObjectiveMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(objectiveDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Objective in the database
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteObjective() throws Exception {
        // Initialize the database
        objectiveRepository.saveAndFlush(objective);

        int databaseSizeBeforeDelete = objectiveRepository.findAll().size();

        // Delete the objective
        restObjectiveMockMvc
            .perform(delete(ENTITY_API_URL_ID, objective.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Objective> objectiveList = objectiveRepository.findAll();
        assertThat(objectiveList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
