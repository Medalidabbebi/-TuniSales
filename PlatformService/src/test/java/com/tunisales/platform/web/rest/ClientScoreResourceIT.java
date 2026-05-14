package com.tunisales.platform.web.rest;

import static com.tunisales.platform.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tunisales.platform.IntegrationTest;
import com.tunisales.platform.domain.ClientScore;
import com.tunisales.platform.domain.enumeration.ScoreClassification;
import com.tunisales.platform.repository.ClientScoreRepository;
import com.tunisales.platform.service.criteria.ClientScoreCriteria;
import com.tunisales.platform.service.dto.ClientScoreDTO;
import com.tunisales.platform.service.mapper.ClientScoreMapper;
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
 * Integration tests for the {@link ClientScoreResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ClientScoreResourceIT {

    private static final Long DEFAULT_TENANT_ID = 1L;
    private static final Long UPDATED_TENANT_ID = 2L;
    private static final Long SMALLER_TENANT_ID = 1L - 1L;

    private static final Long DEFAULT_CLIENT_ID = 1L;
    private static final Long UPDATED_CLIENT_ID = 2L;
    private static final Long SMALLER_CLIENT_ID = 1L - 1L;

    private static final String DEFAULT_CLIENT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_CLIENT_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_PERIOD = "AAAAAAA";
    private static final String UPDATED_PERIOD = "BBBBBBB";

    private static final Integer DEFAULT_SCORE = 0;
    private static final Integer UPDATED_SCORE = 1;
    private static final Integer SMALLER_SCORE = 0 - 1;

    private static final ScoreClassification DEFAULT_CLASSIFICATION = ScoreClassification.EXCELLENT;
    private static final ScoreClassification UPDATED_CLASSIFICATION = ScoreClassification.GOOD;

    private static final String DEFAULT_BREAKDOWN_JSON = "AAAAAAAAAA";
    private static final String UPDATED_BREAKDOWN_JSON = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_CALCULATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CALCULATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_CALCULATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final String ENTITY_API_URL = "/api/client-scores";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ClientScoreRepository clientScoreRepository;

    @Autowired
    private ClientScoreMapper clientScoreMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClientScoreMockMvc;

    private ClientScore clientScore;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClientScore createEntity(EntityManager em) {
        ClientScore clientScore = new ClientScore()
            .tenantId(DEFAULT_TENANT_ID)
            .clientId(DEFAULT_CLIENT_ID)
            .clientName(DEFAULT_CLIENT_NAME)
            .period(DEFAULT_PERIOD)
            .score(DEFAULT_SCORE)
            .classification(DEFAULT_CLASSIFICATION)
            .breakdownJson(DEFAULT_BREAKDOWN_JSON)
            .calculatedAt(DEFAULT_CALCULATED_AT);
        return clientScore;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClientScore createUpdatedEntity(EntityManager em) {
        ClientScore clientScore = new ClientScore()
            .tenantId(UPDATED_TENANT_ID)
            .clientId(UPDATED_CLIENT_ID)
            .clientName(UPDATED_CLIENT_NAME)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .calculatedAt(UPDATED_CALCULATED_AT);
        return clientScore;
    }

    @BeforeEach
    public void initTest() {
        clientScore = createEntity(em);
    }

    @Test
    @Transactional
    void createClientScore() throws Exception {
        int databaseSizeBeforeCreate = clientScoreRepository.findAll().size();
        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);
        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isCreated());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeCreate + 1);
        ClientScore testClientScore = clientScoreList.get(clientScoreList.size() - 1);
        assertThat(testClientScore.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testClientScore.getClientId()).isEqualTo(DEFAULT_CLIENT_ID);
        assertThat(testClientScore.getClientName()).isEqualTo(DEFAULT_CLIENT_NAME);
        assertThat(testClientScore.getPeriod()).isEqualTo(DEFAULT_PERIOD);
        assertThat(testClientScore.getScore()).isEqualTo(DEFAULT_SCORE);
        assertThat(testClientScore.getClassification()).isEqualTo(DEFAULT_CLASSIFICATION);
        assertThat(testClientScore.getBreakdownJson()).isEqualTo(DEFAULT_BREAKDOWN_JSON);
        assertThat(testClientScore.getCalculatedAt()).isEqualTo(DEFAULT_CALCULATED_AT);
    }

    @Test
    @Transactional
    void createClientScoreWithExistingId() throws Exception {
        // Create the ClientScore with an existing ID
        clientScore.setId(1L);
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        int databaseSizeBeforeCreate = clientScoreRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTenantIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientScoreRepository.findAll().size();
        // set the field null
        clientScore.setTenantId(null);

        // Create the ClientScore, which fails.
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkClientIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientScoreRepository.findAll().size();
        // set the field null
        clientScore.setClientId(null);

        // Create the ClientScore, which fails.
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPeriodIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientScoreRepository.findAll().size();
        // set the field null
        clientScore.setPeriod(null);

        // Create the ClientScore, which fails.
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkScoreIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientScoreRepository.findAll().size();
        // set the field null
        clientScore.setScore(null);

        // Create the ClientScore, which fails.
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkClassificationIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientScoreRepository.findAll().size();
        // set the field null
        clientScore.setClassification(null);

        // Create the ClientScore, which fails.
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCalculatedAtIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientScoreRepository.findAll().size();
        // set the field null
        clientScore.setCalculatedAt(null);

        // Create the ClientScore, which fails.
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        restClientScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClientScores() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList
        restClientScoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clientScore.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].clientId").value(hasItem(DEFAULT_CLIENT_ID.intValue())))
            .andExpect(jsonPath("$.[*].clientName").value(hasItem(DEFAULT_CLIENT_NAME)))
            .andExpect(jsonPath("$.[*].period").value(hasItem(DEFAULT_PERIOD)))
            .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
            .andExpect(jsonPath("$.[*].classification").value(hasItem(DEFAULT_CLASSIFICATION.toString())))
            .andExpect(jsonPath("$.[*].breakdownJson").value(hasItem(DEFAULT_BREAKDOWN_JSON.toString())))
            .andExpect(jsonPath("$.[*].calculatedAt").value(hasItem(sameInstant(DEFAULT_CALCULATED_AT))));
    }

    @Test
    @Transactional
    void getClientScore() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get the clientScore
        restClientScoreMockMvc
            .perform(get(ENTITY_API_URL_ID, clientScore.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clientScore.getId().intValue()))
            .andExpect(jsonPath("$.tenantId").value(DEFAULT_TENANT_ID.intValue()))
            .andExpect(jsonPath("$.clientId").value(DEFAULT_CLIENT_ID.intValue()))
            .andExpect(jsonPath("$.clientName").value(DEFAULT_CLIENT_NAME))
            .andExpect(jsonPath("$.period").value(DEFAULT_PERIOD))
            .andExpect(jsonPath("$.score").value(DEFAULT_SCORE))
            .andExpect(jsonPath("$.classification").value(DEFAULT_CLASSIFICATION.toString()))
            .andExpect(jsonPath("$.breakdownJson").value(DEFAULT_BREAKDOWN_JSON.toString()))
            .andExpect(jsonPath("$.calculatedAt").value(sameInstant(DEFAULT_CALCULATED_AT)));
    }

    @Test
    @Transactional
    void getClientScoresByIdFiltering() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        Long id = clientScore.getId();

        defaultClientScoreShouldBeFound("id.equals=" + id);
        defaultClientScoreShouldNotBeFound("id.notEquals=" + id);

        defaultClientScoreShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultClientScoreShouldNotBeFound("id.greaterThan=" + id);

        defaultClientScoreShouldBeFound("id.lessThanOrEqual=" + id);
        defaultClientScoreShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId equals to DEFAULT_TENANT_ID
        defaultClientScoreShouldBeFound("tenantId.equals=" + DEFAULT_TENANT_ID);

        // Get all the clientScoreList where tenantId equals to UPDATED_TENANT_ID
        defaultClientScoreShouldNotBeFound("tenantId.equals=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId in DEFAULT_TENANT_ID or UPDATED_TENANT_ID
        defaultClientScoreShouldBeFound("tenantId.in=" + DEFAULT_TENANT_ID + "," + UPDATED_TENANT_ID);

        // Get all the clientScoreList where tenantId equals to UPDATED_TENANT_ID
        defaultClientScoreShouldNotBeFound("tenantId.in=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId is not null
        defaultClientScoreShouldBeFound("tenantId.specified=true");

        // Get all the clientScoreList where tenantId is null
        defaultClientScoreShouldNotBeFound("tenantId.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId is greater than or equal to DEFAULT_TENANT_ID
        defaultClientScoreShouldBeFound("tenantId.greaterThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the clientScoreList where tenantId is greater than or equal to UPDATED_TENANT_ID
        defaultClientScoreShouldNotBeFound("tenantId.greaterThanOrEqual=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId is less than or equal to DEFAULT_TENANT_ID
        defaultClientScoreShouldBeFound("tenantId.lessThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the clientScoreList where tenantId is less than or equal to SMALLER_TENANT_ID
        defaultClientScoreShouldNotBeFound("tenantId.lessThanOrEqual=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsLessThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId is less than DEFAULT_TENANT_ID
        defaultClientScoreShouldNotBeFound("tenantId.lessThan=" + DEFAULT_TENANT_ID);

        // Get all the clientScoreList where tenantId is less than UPDATED_TENANT_ID
        defaultClientScoreShouldBeFound("tenantId.lessThan=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByTenantIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where tenantId is greater than DEFAULT_TENANT_ID
        defaultClientScoreShouldNotBeFound("tenantId.greaterThan=" + DEFAULT_TENANT_ID);

        // Get all the clientScoreList where tenantId is greater than SMALLER_TENANT_ID
        defaultClientScoreShouldBeFound("tenantId.greaterThan=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId equals to DEFAULT_CLIENT_ID
        defaultClientScoreShouldBeFound("clientId.equals=" + DEFAULT_CLIENT_ID);

        // Get all the clientScoreList where clientId equals to UPDATED_CLIENT_ID
        defaultClientScoreShouldNotBeFound("clientId.equals=" + UPDATED_CLIENT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId in DEFAULT_CLIENT_ID or UPDATED_CLIENT_ID
        defaultClientScoreShouldBeFound("clientId.in=" + DEFAULT_CLIENT_ID + "," + UPDATED_CLIENT_ID);

        // Get all the clientScoreList where clientId equals to UPDATED_CLIENT_ID
        defaultClientScoreShouldNotBeFound("clientId.in=" + UPDATED_CLIENT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId is not null
        defaultClientScoreShouldBeFound("clientId.specified=true");

        // Get all the clientScoreList where clientId is null
        defaultClientScoreShouldNotBeFound("clientId.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId is greater than or equal to DEFAULT_CLIENT_ID
        defaultClientScoreShouldBeFound("clientId.greaterThanOrEqual=" + DEFAULT_CLIENT_ID);

        // Get all the clientScoreList where clientId is greater than or equal to UPDATED_CLIENT_ID
        defaultClientScoreShouldNotBeFound("clientId.greaterThanOrEqual=" + UPDATED_CLIENT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId is less than or equal to DEFAULT_CLIENT_ID
        defaultClientScoreShouldBeFound("clientId.lessThanOrEqual=" + DEFAULT_CLIENT_ID);

        // Get all the clientScoreList where clientId is less than or equal to SMALLER_CLIENT_ID
        defaultClientScoreShouldNotBeFound("clientId.lessThanOrEqual=" + SMALLER_CLIENT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsLessThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId is less than DEFAULT_CLIENT_ID
        defaultClientScoreShouldNotBeFound("clientId.lessThan=" + DEFAULT_CLIENT_ID);

        // Get all the clientScoreList where clientId is less than UPDATED_CLIENT_ID
        defaultClientScoreShouldBeFound("clientId.lessThan=" + UPDATED_CLIENT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientId is greater than DEFAULT_CLIENT_ID
        defaultClientScoreShouldNotBeFound("clientId.greaterThan=" + DEFAULT_CLIENT_ID);

        // Get all the clientScoreList where clientId is greater than SMALLER_CLIENT_ID
        defaultClientScoreShouldBeFound("clientId.greaterThan=" + SMALLER_CLIENT_ID);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientNameIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientName equals to DEFAULT_CLIENT_NAME
        defaultClientScoreShouldBeFound("clientName.equals=" + DEFAULT_CLIENT_NAME);

        // Get all the clientScoreList where clientName equals to UPDATED_CLIENT_NAME
        defaultClientScoreShouldNotBeFound("clientName.equals=" + UPDATED_CLIENT_NAME);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientNameIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientName in DEFAULT_CLIENT_NAME or UPDATED_CLIENT_NAME
        defaultClientScoreShouldBeFound("clientName.in=" + DEFAULT_CLIENT_NAME + "," + UPDATED_CLIENT_NAME);

        // Get all the clientScoreList where clientName equals to UPDATED_CLIENT_NAME
        defaultClientScoreShouldNotBeFound("clientName.in=" + UPDATED_CLIENT_NAME);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientName is not null
        defaultClientScoreShouldBeFound("clientName.specified=true");

        // Get all the clientScoreList where clientName is null
        defaultClientScoreShouldNotBeFound("clientName.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByClientNameContainsSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientName contains DEFAULT_CLIENT_NAME
        defaultClientScoreShouldBeFound("clientName.contains=" + DEFAULT_CLIENT_NAME);

        // Get all the clientScoreList where clientName contains UPDATED_CLIENT_NAME
        defaultClientScoreShouldNotBeFound("clientName.contains=" + UPDATED_CLIENT_NAME);
    }

    @Test
    @Transactional
    void getAllClientScoresByClientNameNotContainsSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where clientName does not contain DEFAULT_CLIENT_NAME
        defaultClientScoreShouldNotBeFound("clientName.doesNotContain=" + DEFAULT_CLIENT_NAME);

        // Get all the clientScoreList where clientName does not contain UPDATED_CLIENT_NAME
        defaultClientScoreShouldBeFound("clientName.doesNotContain=" + UPDATED_CLIENT_NAME);
    }

    @Test
    @Transactional
    void getAllClientScoresByPeriodIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where period equals to DEFAULT_PERIOD
        defaultClientScoreShouldBeFound("period.equals=" + DEFAULT_PERIOD);

        // Get all the clientScoreList where period equals to UPDATED_PERIOD
        defaultClientScoreShouldNotBeFound("period.equals=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllClientScoresByPeriodIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where period in DEFAULT_PERIOD or UPDATED_PERIOD
        defaultClientScoreShouldBeFound("period.in=" + DEFAULT_PERIOD + "," + UPDATED_PERIOD);

        // Get all the clientScoreList where period equals to UPDATED_PERIOD
        defaultClientScoreShouldNotBeFound("period.in=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllClientScoresByPeriodIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where period is not null
        defaultClientScoreShouldBeFound("period.specified=true");

        // Get all the clientScoreList where period is null
        defaultClientScoreShouldNotBeFound("period.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByPeriodContainsSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where period contains DEFAULT_PERIOD
        defaultClientScoreShouldBeFound("period.contains=" + DEFAULT_PERIOD);

        // Get all the clientScoreList where period contains UPDATED_PERIOD
        defaultClientScoreShouldNotBeFound("period.contains=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllClientScoresByPeriodNotContainsSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where period does not contain DEFAULT_PERIOD
        defaultClientScoreShouldNotBeFound("period.doesNotContain=" + DEFAULT_PERIOD);

        // Get all the clientScoreList where period does not contain UPDATED_PERIOD
        defaultClientScoreShouldBeFound("period.doesNotContain=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score equals to DEFAULT_SCORE
        defaultClientScoreShouldBeFound("score.equals=" + DEFAULT_SCORE);

        // Get all the clientScoreList where score equals to UPDATED_SCORE
        defaultClientScoreShouldNotBeFound("score.equals=" + UPDATED_SCORE);
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score in DEFAULT_SCORE or UPDATED_SCORE
        defaultClientScoreShouldBeFound("score.in=" + DEFAULT_SCORE + "," + UPDATED_SCORE);

        // Get all the clientScoreList where score equals to UPDATED_SCORE
        defaultClientScoreShouldNotBeFound("score.in=" + UPDATED_SCORE);
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score is not null
        defaultClientScoreShouldBeFound("score.specified=true");

        // Get all the clientScoreList where score is null
        defaultClientScoreShouldNotBeFound("score.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score is greater than or equal to DEFAULT_SCORE
        defaultClientScoreShouldBeFound("score.greaterThanOrEqual=" + DEFAULT_SCORE);

        // Get all the clientScoreList where score is greater than or equal to (DEFAULT_SCORE + 1)
        defaultClientScoreShouldNotBeFound("score.greaterThanOrEqual=" + (DEFAULT_SCORE + 1));
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score is less than or equal to DEFAULT_SCORE
        defaultClientScoreShouldBeFound("score.lessThanOrEqual=" + DEFAULT_SCORE);

        // Get all the clientScoreList where score is less than or equal to SMALLER_SCORE
        defaultClientScoreShouldNotBeFound("score.lessThanOrEqual=" + SMALLER_SCORE);
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsLessThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score is less than DEFAULT_SCORE
        defaultClientScoreShouldNotBeFound("score.lessThan=" + DEFAULT_SCORE);

        // Get all the clientScoreList where score is less than (DEFAULT_SCORE + 1)
        defaultClientScoreShouldBeFound("score.lessThan=" + (DEFAULT_SCORE + 1));
    }

    @Test
    @Transactional
    void getAllClientScoresByScoreIsGreaterThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where score is greater than DEFAULT_SCORE
        defaultClientScoreShouldNotBeFound("score.greaterThan=" + DEFAULT_SCORE);

        // Get all the clientScoreList where score is greater than SMALLER_SCORE
        defaultClientScoreShouldBeFound("score.greaterThan=" + SMALLER_SCORE);
    }

    @Test
    @Transactional
    void getAllClientScoresByClassificationIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where classification equals to DEFAULT_CLASSIFICATION
        defaultClientScoreShouldBeFound("classification.equals=" + DEFAULT_CLASSIFICATION);

        // Get all the clientScoreList where classification equals to UPDATED_CLASSIFICATION
        defaultClientScoreShouldNotBeFound("classification.equals=" + UPDATED_CLASSIFICATION);
    }

    @Test
    @Transactional
    void getAllClientScoresByClassificationIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where classification in DEFAULT_CLASSIFICATION or UPDATED_CLASSIFICATION
        defaultClientScoreShouldBeFound("classification.in=" + DEFAULT_CLASSIFICATION + "," + UPDATED_CLASSIFICATION);

        // Get all the clientScoreList where classification equals to UPDATED_CLASSIFICATION
        defaultClientScoreShouldNotBeFound("classification.in=" + UPDATED_CLASSIFICATION);
    }

    @Test
    @Transactional
    void getAllClientScoresByClassificationIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where classification is not null
        defaultClientScoreShouldBeFound("classification.specified=true");

        // Get all the clientScoreList where classification is null
        defaultClientScoreShouldNotBeFound("classification.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt equals to DEFAULT_CALCULATED_AT
        defaultClientScoreShouldBeFound("calculatedAt.equals=" + DEFAULT_CALCULATED_AT);

        // Get all the clientScoreList where calculatedAt equals to UPDATED_CALCULATED_AT
        defaultClientScoreShouldNotBeFound("calculatedAt.equals=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt in DEFAULT_CALCULATED_AT or UPDATED_CALCULATED_AT
        defaultClientScoreShouldBeFound("calculatedAt.in=" + DEFAULT_CALCULATED_AT + "," + UPDATED_CALCULATED_AT);

        // Get all the clientScoreList where calculatedAt equals to UPDATED_CALCULATED_AT
        defaultClientScoreShouldNotBeFound("calculatedAt.in=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt is not null
        defaultClientScoreShouldBeFound("calculatedAt.specified=true");

        // Get all the clientScoreList where calculatedAt is null
        defaultClientScoreShouldNotBeFound("calculatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt is greater than or equal to DEFAULT_CALCULATED_AT
        defaultClientScoreShouldBeFound("calculatedAt.greaterThanOrEqual=" + DEFAULT_CALCULATED_AT);

        // Get all the clientScoreList where calculatedAt is greater than or equal to UPDATED_CALCULATED_AT
        defaultClientScoreShouldNotBeFound("calculatedAt.greaterThanOrEqual=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt is less than or equal to DEFAULT_CALCULATED_AT
        defaultClientScoreShouldBeFound("calculatedAt.lessThanOrEqual=" + DEFAULT_CALCULATED_AT);

        // Get all the clientScoreList where calculatedAt is less than or equal to SMALLER_CALCULATED_AT
        defaultClientScoreShouldNotBeFound("calculatedAt.lessThanOrEqual=" + SMALLER_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt is less than DEFAULT_CALCULATED_AT
        defaultClientScoreShouldNotBeFound("calculatedAt.lessThan=" + DEFAULT_CALCULATED_AT);

        // Get all the clientScoreList where calculatedAt is less than UPDATED_CALCULATED_AT
        defaultClientScoreShouldBeFound("calculatedAt.lessThan=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllClientScoresByCalculatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        // Get all the clientScoreList where calculatedAt is greater than DEFAULT_CALCULATED_AT
        defaultClientScoreShouldNotBeFound("calculatedAt.greaterThan=" + DEFAULT_CALCULATED_AT);

        // Get all the clientScoreList where calculatedAt is greater than SMALLER_CALCULATED_AT
        defaultClientScoreShouldBeFound("calculatedAt.greaterThan=" + SMALLER_CALCULATED_AT);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultClientScoreShouldBeFound(String filter) throws Exception {
        restClientScoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clientScore.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].clientId").value(hasItem(DEFAULT_CLIENT_ID.intValue())))
            .andExpect(jsonPath("$.[*].clientName").value(hasItem(DEFAULT_CLIENT_NAME)))
            .andExpect(jsonPath("$.[*].period").value(hasItem(DEFAULT_PERIOD)))
            .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
            .andExpect(jsonPath("$.[*].classification").value(hasItem(DEFAULT_CLASSIFICATION.toString())))
            .andExpect(jsonPath("$.[*].breakdownJson").value(hasItem(DEFAULT_BREAKDOWN_JSON.toString())))
            .andExpect(jsonPath("$.[*].calculatedAt").value(hasItem(sameInstant(DEFAULT_CALCULATED_AT))));

        // Check, that the count call also returns 1
        restClientScoreMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultClientScoreShouldNotBeFound(String filter) throws Exception {
        restClientScoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restClientScoreMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingClientScore() throws Exception {
        // Get the clientScore
        restClientScoreMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingClientScore() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();

        // Update the clientScore
        ClientScore updatedClientScore = clientScoreRepository.findById(clientScore.getId()).get();
        // Disconnect from session so that the updates on updatedClientScore are not directly saved in db
        em.detach(updatedClientScore);
        updatedClientScore
            .tenantId(UPDATED_TENANT_ID)
            .clientId(UPDATED_CLIENT_ID)
            .clientName(UPDATED_CLIENT_NAME)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .calculatedAt(UPDATED_CALCULATED_AT);
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(updatedClientScore);

        restClientScoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clientScoreDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isOk());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
        ClientScore testClientScore = clientScoreList.get(clientScoreList.size() - 1);
        assertThat(testClientScore.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testClientScore.getClientId()).isEqualTo(UPDATED_CLIENT_ID);
        assertThat(testClientScore.getClientName()).isEqualTo(UPDATED_CLIENT_NAME);
        assertThat(testClientScore.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testClientScore.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testClientScore.getClassification()).isEqualTo(UPDATED_CLASSIFICATION);
        assertThat(testClientScore.getBreakdownJson()).isEqualTo(UPDATED_BREAKDOWN_JSON);
        assertThat(testClientScore.getCalculatedAt()).isEqualTo(UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void putNonExistingClientScore() throws Exception {
        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();
        clientScore.setId(count.incrementAndGet());

        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClientScoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clientScoreDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchClientScore() throws Exception {
        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();
        clientScore.setId(count.incrementAndGet());

        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClientScoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClientScore() throws Exception {
        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();
        clientScore.setId(count.incrementAndGet());

        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClientScoreMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clientScoreDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClientScoreWithPatch() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();

        // Update the clientScore using partial update
        ClientScore partialUpdatedClientScore = new ClientScore();
        partialUpdatedClientScore.setId(clientScore.getId());

        partialUpdatedClientScore
            .tenantId(UPDATED_TENANT_ID)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON);

        restClientScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClientScore.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClientScore))
            )
            .andExpect(status().isOk());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
        ClientScore testClientScore = clientScoreList.get(clientScoreList.size() - 1);
        assertThat(testClientScore.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testClientScore.getClientId()).isEqualTo(DEFAULT_CLIENT_ID);
        assertThat(testClientScore.getClientName()).isEqualTo(DEFAULT_CLIENT_NAME);
        assertThat(testClientScore.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testClientScore.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testClientScore.getClassification()).isEqualTo(UPDATED_CLASSIFICATION);
        assertThat(testClientScore.getBreakdownJson()).isEqualTo(UPDATED_BREAKDOWN_JSON);
        assertThat(testClientScore.getCalculatedAt()).isEqualTo(DEFAULT_CALCULATED_AT);
    }

    @Test
    @Transactional
    void fullUpdateClientScoreWithPatch() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();

        // Update the clientScore using partial update
        ClientScore partialUpdatedClientScore = new ClientScore();
        partialUpdatedClientScore.setId(clientScore.getId());

        partialUpdatedClientScore
            .tenantId(UPDATED_TENANT_ID)
            .clientId(UPDATED_CLIENT_ID)
            .clientName(UPDATED_CLIENT_NAME)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .calculatedAt(UPDATED_CALCULATED_AT);

        restClientScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClientScore.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClientScore))
            )
            .andExpect(status().isOk());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
        ClientScore testClientScore = clientScoreList.get(clientScoreList.size() - 1);
        assertThat(testClientScore.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testClientScore.getClientId()).isEqualTo(UPDATED_CLIENT_ID);
        assertThat(testClientScore.getClientName()).isEqualTo(UPDATED_CLIENT_NAME);
        assertThat(testClientScore.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testClientScore.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testClientScore.getClassification()).isEqualTo(UPDATED_CLASSIFICATION);
        assertThat(testClientScore.getBreakdownJson()).isEqualTo(UPDATED_BREAKDOWN_JSON);
        assertThat(testClientScore.getCalculatedAt()).isEqualTo(UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void patchNonExistingClientScore() throws Exception {
        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();
        clientScore.setId(count.incrementAndGet());

        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClientScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clientScoreDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClientScore() throws Exception {
        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();
        clientScore.setId(count.incrementAndGet());

        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClientScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClientScore() throws Exception {
        int databaseSizeBeforeUpdate = clientScoreRepository.findAll().size();
        clientScore.setId(count.incrementAndGet());

        // Create the ClientScore
        ClientScoreDTO clientScoreDTO = clientScoreMapper.toDto(clientScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClientScoreMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(clientScoreDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClientScore in the database
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteClientScore() throws Exception {
        // Initialize the database
        clientScoreRepository.saveAndFlush(clientScore);

        int databaseSizeBeforeDelete = clientScoreRepository.findAll().size();

        // Delete the clientScore
        restClientScoreMockMvc
            .perform(delete(ENTITY_API_URL_ID, clientScore.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<ClientScore> clientScoreList = clientScoreRepository.findAll();
        assertThat(clientScoreList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
