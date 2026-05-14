package com.tunisales.platform.web.rest;

import static com.tunisales.platform.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tunisales.platform.IntegrationTest;
import com.tunisales.platform.domain.PerformanceScore;
import com.tunisales.platform.domain.enumeration.ScoreClassification;
import com.tunisales.platform.repository.PerformanceScoreRepository;
import com.tunisales.platform.service.criteria.PerformanceScoreCriteria;
import com.tunisales.platform.service.dto.PerformanceScoreDTO;
import com.tunisales.platform.service.mapper.PerformanceScoreMapper;
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
 * Integration tests for the {@link PerformanceScoreResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PerformanceScoreResourceIT {

    private static final Long DEFAULT_TENANT_ID = 1L;
    private static final Long UPDATED_TENANT_ID = 2L;
    private static final Long SMALLER_TENANT_ID = 1L - 1L;

    private static final String DEFAULT_USER_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_USER_LOGIN = "BBBBBBBBBB";

    private static final String DEFAULT_PERIOD = "AAAAAAA";
    private static final String UPDATED_PERIOD = "BBBBBBB";

    private static final Integer DEFAULT_SCORE = 0;
    private static final Integer UPDATED_SCORE = 1;
    private static final Integer SMALLER_SCORE = 0 - 1;

    private static final ScoreClassification DEFAULT_CLASSIFICATION = ScoreClassification.EXCELLENT;
    private static final ScoreClassification UPDATED_CLASSIFICATION = ScoreClassification.GOOD;

    private static final String DEFAULT_BREAKDOWN_JSON = "AAAAAAAAAA";
    private static final String UPDATED_BREAKDOWN_JSON = "BBBBBBBBBB";

    private static final Integer DEFAULT_DELTA_VS_PREVIOUS = 1;
    private static final Integer UPDATED_DELTA_VS_PREVIOUS = 2;
    private static final Integer SMALLER_DELTA_VS_PREVIOUS = 1 - 1;

    private static final ZonedDateTime DEFAULT_CALCULATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CALCULATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_CALCULATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final String ENTITY_API_URL = "/api/performance-scores";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private PerformanceScoreRepository performanceScoreRepository;

    @Autowired
    private PerformanceScoreMapper performanceScoreMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPerformanceScoreMockMvc;

    private PerformanceScore performanceScore;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PerformanceScore createEntity(EntityManager em) {
        PerformanceScore performanceScore = new PerformanceScore()
            .tenantId(DEFAULT_TENANT_ID)
            .userLogin(DEFAULT_USER_LOGIN)
            .period(DEFAULT_PERIOD)
            .score(DEFAULT_SCORE)
            .classification(DEFAULT_CLASSIFICATION)
            .breakdownJson(DEFAULT_BREAKDOWN_JSON)
            .deltaVsPrevious(DEFAULT_DELTA_VS_PREVIOUS)
            .calculatedAt(DEFAULT_CALCULATED_AT);
        return performanceScore;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PerformanceScore createUpdatedEntity(EntityManager em) {
        PerformanceScore performanceScore = new PerformanceScore()
            .tenantId(UPDATED_TENANT_ID)
            .userLogin(UPDATED_USER_LOGIN)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .deltaVsPrevious(UPDATED_DELTA_VS_PREVIOUS)
            .calculatedAt(UPDATED_CALCULATED_AT);
        return performanceScore;
    }

    @BeforeEach
    public void initTest() {
        performanceScore = createEntity(em);
    }

    @Test
    @Transactional
    void createPerformanceScore() throws Exception {
        int databaseSizeBeforeCreate = performanceScoreRepository.findAll().size();
        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);
        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isCreated());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeCreate + 1);
        PerformanceScore testPerformanceScore = performanceScoreList.get(performanceScoreList.size() - 1);
        assertThat(testPerformanceScore.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testPerformanceScore.getUserLogin()).isEqualTo(DEFAULT_USER_LOGIN);
        assertThat(testPerformanceScore.getPeriod()).isEqualTo(DEFAULT_PERIOD);
        assertThat(testPerformanceScore.getScore()).isEqualTo(DEFAULT_SCORE);
        assertThat(testPerformanceScore.getClassification()).isEqualTo(DEFAULT_CLASSIFICATION);
        assertThat(testPerformanceScore.getBreakdownJson()).isEqualTo(DEFAULT_BREAKDOWN_JSON);
        assertThat(testPerformanceScore.getDeltaVsPrevious()).isEqualTo(DEFAULT_DELTA_VS_PREVIOUS);
        assertThat(testPerformanceScore.getCalculatedAt()).isEqualTo(DEFAULT_CALCULATED_AT);
    }

    @Test
    @Transactional
    void createPerformanceScoreWithExistingId() throws Exception {
        // Create the PerformanceScore with an existing ID
        performanceScore.setId(1L);
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        int databaseSizeBeforeCreate = performanceScoreRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTenantIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = performanceScoreRepository.findAll().size();
        // set the field null
        performanceScore.setTenantId(null);

        // Create the PerformanceScore, which fails.
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUserLoginIsRequired() throws Exception {
        int databaseSizeBeforeTest = performanceScoreRepository.findAll().size();
        // set the field null
        performanceScore.setUserLogin(null);

        // Create the PerformanceScore, which fails.
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPeriodIsRequired() throws Exception {
        int databaseSizeBeforeTest = performanceScoreRepository.findAll().size();
        // set the field null
        performanceScore.setPeriod(null);

        // Create the PerformanceScore, which fails.
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkScoreIsRequired() throws Exception {
        int databaseSizeBeforeTest = performanceScoreRepository.findAll().size();
        // set the field null
        performanceScore.setScore(null);

        // Create the PerformanceScore, which fails.
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkClassificationIsRequired() throws Exception {
        int databaseSizeBeforeTest = performanceScoreRepository.findAll().size();
        // set the field null
        performanceScore.setClassification(null);

        // Create the PerformanceScore, which fails.
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCalculatedAtIsRequired() throws Exception {
        int databaseSizeBeforeTest = performanceScoreRepository.findAll().size();
        // set the field null
        performanceScore.setCalculatedAt(null);

        // Create the PerformanceScore, which fails.
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        restPerformanceScoreMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPerformanceScores() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList
        restPerformanceScoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(performanceScore.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].userLogin").value(hasItem(DEFAULT_USER_LOGIN)))
            .andExpect(jsonPath("$.[*].period").value(hasItem(DEFAULT_PERIOD)))
            .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
            .andExpect(jsonPath("$.[*].classification").value(hasItem(DEFAULT_CLASSIFICATION.toString())))
            .andExpect(jsonPath("$.[*].breakdownJson").value(hasItem(DEFAULT_BREAKDOWN_JSON.toString())))
            .andExpect(jsonPath("$.[*].deltaVsPrevious").value(hasItem(DEFAULT_DELTA_VS_PREVIOUS)))
            .andExpect(jsonPath("$.[*].calculatedAt").value(hasItem(sameInstant(DEFAULT_CALCULATED_AT))));
    }

    @Test
    @Transactional
    void getPerformanceScore() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get the performanceScore
        restPerformanceScoreMockMvc
            .perform(get(ENTITY_API_URL_ID, performanceScore.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(performanceScore.getId().intValue()))
            .andExpect(jsonPath("$.tenantId").value(DEFAULT_TENANT_ID.intValue()))
            .andExpect(jsonPath("$.userLogin").value(DEFAULT_USER_LOGIN))
            .andExpect(jsonPath("$.period").value(DEFAULT_PERIOD))
            .andExpect(jsonPath("$.score").value(DEFAULT_SCORE))
            .andExpect(jsonPath("$.classification").value(DEFAULT_CLASSIFICATION.toString()))
            .andExpect(jsonPath("$.breakdownJson").value(DEFAULT_BREAKDOWN_JSON.toString()))
            .andExpect(jsonPath("$.deltaVsPrevious").value(DEFAULT_DELTA_VS_PREVIOUS))
            .andExpect(jsonPath("$.calculatedAt").value(sameInstant(DEFAULT_CALCULATED_AT)));
    }

    @Test
    @Transactional
    void getPerformanceScoresByIdFiltering() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        Long id = performanceScore.getId();

        defaultPerformanceScoreShouldBeFound("id.equals=" + id);
        defaultPerformanceScoreShouldNotBeFound("id.notEquals=" + id);

        defaultPerformanceScoreShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultPerformanceScoreShouldNotBeFound("id.greaterThan=" + id);

        defaultPerformanceScoreShouldBeFound("id.lessThanOrEqual=" + id);
        defaultPerformanceScoreShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId equals to DEFAULT_TENANT_ID
        defaultPerformanceScoreShouldBeFound("tenantId.equals=" + DEFAULT_TENANT_ID);

        // Get all the performanceScoreList where tenantId equals to UPDATED_TENANT_ID
        defaultPerformanceScoreShouldNotBeFound("tenantId.equals=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId in DEFAULT_TENANT_ID or UPDATED_TENANT_ID
        defaultPerformanceScoreShouldBeFound("tenantId.in=" + DEFAULT_TENANT_ID + "," + UPDATED_TENANT_ID);

        // Get all the performanceScoreList where tenantId equals to UPDATED_TENANT_ID
        defaultPerformanceScoreShouldNotBeFound("tenantId.in=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId is not null
        defaultPerformanceScoreShouldBeFound("tenantId.specified=true");

        // Get all the performanceScoreList where tenantId is null
        defaultPerformanceScoreShouldNotBeFound("tenantId.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId is greater than or equal to DEFAULT_TENANT_ID
        defaultPerformanceScoreShouldBeFound("tenantId.greaterThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the performanceScoreList where tenantId is greater than or equal to UPDATED_TENANT_ID
        defaultPerformanceScoreShouldNotBeFound("tenantId.greaterThanOrEqual=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId is less than or equal to DEFAULT_TENANT_ID
        defaultPerformanceScoreShouldBeFound("tenantId.lessThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the performanceScoreList where tenantId is less than or equal to SMALLER_TENANT_ID
        defaultPerformanceScoreShouldNotBeFound("tenantId.lessThanOrEqual=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsLessThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId is less than DEFAULT_TENANT_ID
        defaultPerformanceScoreShouldNotBeFound("tenantId.lessThan=" + DEFAULT_TENANT_ID);

        // Get all the performanceScoreList where tenantId is less than UPDATED_TENANT_ID
        defaultPerformanceScoreShouldBeFound("tenantId.lessThan=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByTenantIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where tenantId is greater than DEFAULT_TENANT_ID
        defaultPerformanceScoreShouldNotBeFound("tenantId.greaterThan=" + DEFAULT_TENANT_ID);

        // Get all the performanceScoreList where tenantId is greater than SMALLER_TENANT_ID
        defaultPerformanceScoreShouldBeFound("tenantId.greaterThan=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByUserLoginIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where userLogin equals to DEFAULT_USER_LOGIN
        defaultPerformanceScoreShouldBeFound("userLogin.equals=" + DEFAULT_USER_LOGIN);

        // Get all the performanceScoreList where userLogin equals to UPDATED_USER_LOGIN
        defaultPerformanceScoreShouldNotBeFound("userLogin.equals=" + UPDATED_USER_LOGIN);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByUserLoginIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where userLogin in DEFAULT_USER_LOGIN or UPDATED_USER_LOGIN
        defaultPerformanceScoreShouldBeFound("userLogin.in=" + DEFAULT_USER_LOGIN + "," + UPDATED_USER_LOGIN);

        // Get all the performanceScoreList where userLogin equals to UPDATED_USER_LOGIN
        defaultPerformanceScoreShouldNotBeFound("userLogin.in=" + UPDATED_USER_LOGIN);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByUserLoginIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where userLogin is not null
        defaultPerformanceScoreShouldBeFound("userLogin.specified=true");

        // Get all the performanceScoreList where userLogin is null
        defaultPerformanceScoreShouldNotBeFound("userLogin.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByUserLoginContainsSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where userLogin contains DEFAULT_USER_LOGIN
        defaultPerformanceScoreShouldBeFound("userLogin.contains=" + DEFAULT_USER_LOGIN);

        // Get all the performanceScoreList where userLogin contains UPDATED_USER_LOGIN
        defaultPerformanceScoreShouldNotBeFound("userLogin.contains=" + UPDATED_USER_LOGIN);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByUserLoginNotContainsSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where userLogin does not contain DEFAULT_USER_LOGIN
        defaultPerformanceScoreShouldNotBeFound("userLogin.doesNotContain=" + DEFAULT_USER_LOGIN);

        // Get all the performanceScoreList where userLogin does not contain UPDATED_USER_LOGIN
        defaultPerformanceScoreShouldBeFound("userLogin.doesNotContain=" + UPDATED_USER_LOGIN);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByPeriodIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where period equals to DEFAULT_PERIOD
        defaultPerformanceScoreShouldBeFound("period.equals=" + DEFAULT_PERIOD);

        // Get all the performanceScoreList where period equals to UPDATED_PERIOD
        defaultPerformanceScoreShouldNotBeFound("period.equals=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByPeriodIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where period in DEFAULT_PERIOD or UPDATED_PERIOD
        defaultPerformanceScoreShouldBeFound("period.in=" + DEFAULT_PERIOD + "," + UPDATED_PERIOD);

        // Get all the performanceScoreList where period equals to UPDATED_PERIOD
        defaultPerformanceScoreShouldNotBeFound("period.in=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByPeriodIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where period is not null
        defaultPerformanceScoreShouldBeFound("period.specified=true");

        // Get all the performanceScoreList where period is null
        defaultPerformanceScoreShouldNotBeFound("period.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByPeriodContainsSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where period contains DEFAULT_PERIOD
        defaultPerformanceScoreShouldBeFound("period.contains=" + DEFAULT_PERIOD);

        // Get all the performanceScoreList where period contains UPDATED_PERIOD
        defaultPerformanceScoreShouldNotBeFound("period.contains=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByPeriodNotContainsSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where period does not contain DEFAULT_PERIOD
        defaultPerformanceScoreShouldNotBeFound("period.doesNotContain=" + DEFAULT_PERIOD);

        // Get all the performanceScoreList where period does not contain UPDATED_PERIOD
        defaultPerformanceScoreShouldBeFound("period.doesNotContain=" + UPDATED_PERIOD);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score equals to DEFAULT_SCORE
        defaultPerformanceScoreShouldBeFound("score.equals=" + DEFAULT_SCORE);

        // Get all the performanceScoreList where score equals to UPDATED_SCORE
        defaultPerformanceScoreShouldNotBeFound("score.equals=" + UPDATED_SCORE);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score in DEFAULT_SCORE or UPDATED_SCORE
        defaultPerformanceScoreShouldBeFound("score.in=" + DEFAULT_SCORE + "," + UPDATED_SCORE);

        // Get all the performanceScoreList where score equals to UPDATED_SCORE
        defaultPerformanceScoreShouldNotBeFound("score.in=" + UPDATED_SCORE);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score is not null
        defaultPerformanceScoreShouldBeFound("score.specified=true");

        // Get all the performanceScoreList where score is null
        defaultPerformanceScoreShouldNotBeFound("score.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score is greater than or equal to DEFAULT_SCORE
        defaultPerformanceScoreShouldBeFound("score.greaterThanOrEqual=" + DEFAULT_SCORE);

        // Get all the performanceScoreList where score is greater than or equal to (DEFAULT_SCORE + 1)
        defaultPerformanceScoreShouldNotBeFound("score.greaterThanOrEqual=" + (DEFAULT_SCORE + 1));
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score is less than or equal to DEFAULT_SCORE
        defaultPerformanceScoreShouldBeFound("score.lessThanOrEqual=" + DEFAULT_SCORE);

        // Get all the performanceScoreList where score is less than or equal to SMALLER_SCORE
        defaultPerformanceScoreShouldNotBeFound("score.lessThanOrEqual=" + SMALLER_SCORE);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsLessThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score is less than DEFAULT_SCORE
        defaultPerformanceScoreShouldNotBeFound("score.lessThan=" + DEFAULT_SCORE);

        // Get all the performanceScoreList where score is less than (DEFAULT_SCORE + 1)
        defaultPerformanceScoreShouldBeFound("score.lessThan=" + (DEFAULT_SCORE + 1));
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByScoreIsGreaterThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where score is greater than DEFAULT_SCORE
        defaultPerformanceScoreShouldNotBeFound("score.greaterThan=" + DEFAULT_SCORE);

        // Get all the performanceScoreList where score is greater than SMALLER_SCORE
        defaultPerformanceScoreShouldBeFound("score.greaterThan=" + SMALLER_SCORE);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByClassificationIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where classification equals to DEFAULT_CLASSIFICATION
        defaultPerformanceScoreShouldBeFound("classification.equals=" + DEFAULT_CLASSIFICATION);

        // Get all the performanceScoreList where classification equals to UPDATED_CLASSIFICATION
        defaultPerformanceScoreShouldNotBeFound("classification.equals=" + UPDATED_CLASSIFICATION);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByClassificationIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where classification in DEFAULT_CLASSIFICATION or UPDATED_CLASSIFICATION
        defaultPerformanceScoreShouldBeFound("classification.in=" + DEFAULT_CLASSIFICATION + "," + UPDATED_CLASSIFICATION);

        // Get all the performanceScoreList where classification equals to UPDATED_CLASSIFICATION
        defaultPerformanceScoreShouldNotBeFound("classification.in=" + UPDATED_CLASSIFICATION);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByClassificationIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where classification is not null
        defaultPerformanceScoreShouldBeFound("classification.specified=true");

        // Get all the performanceScoreList where classification is null
        defaultPerformanceScoreShouldNotBeFound("classification.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious equals to DEFAULT_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.equals=" + DEFAULT_DELTA_VS_PREVIOUS);

        // Get all the performanceScoreList where deltaVsPrevious equals to UPDATED_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.equals=" + UPDATED_DELTA_VS_PREVIOUS);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious in DEFAULT_DELTA_VS_PREVIOUS or UPDATED_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.in=" + DEFAULT_DELTA_VS_PREVIOUS + "," + UPDATED_DELTA_VS_PREVIOUS);

        // Get all the performanceScoreList where deltaVsPrevious equals to UPDATED_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.in=" + UPDATED_DELTA_VS_PREVIOUS);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious is not null
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.specified=true");

        // Get all the performanceScoreList where deltaVsPrevious is null
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious is greater than or equal to DEFAULT_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.greaterThanOrEqual=" + DEFAULT_DELTA_VS_PREVIOUS);

        // Get all the performanceScoreList where deltaVsPrevious is greater than or equal to UPDATED_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.greaterThanOrEqual=" + UPDATED_DELTA_VS_PREVIOUS);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious is less than or equal to DEFAULT_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.lessThanOrEqual=" + DEFAULT_DELTA_VS_PREVIOUS);

        // Get all the performanceScoreList where deltaVsPrevious is less than or equal to SMALLER_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.lessThanOrEqual=" + SMALLER_DELTA_VS_PREVIOUS);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsLessThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious is less than DEFAULT_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.lessThan=" + DEFAULT_DELTA_VS_PREVIOUS);

        // Get all the performanceScoreList where deltaVsPrevious is less than UPDATED_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.lessThan=" + UPDATED_DELTA_VS_PREVIOUS);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByDeltaVsPreviousIsGreaterThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where deltaVsPrevious is greater than DEFAULT_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldNotBeFound("deltaVsPrevious.greaterThan=" + DEFAULT_DELTA_VS_PREVIOUS);

        // Get all the performanceScoreList where deltaVsPrevious is greater than SMALLER_DELTA_VS_PREVIOUS
        defaultPerformanceScoreShouldBeFound("deltaVsPrevious.greaterThan=" + SMALLER_DELTA_VS_PREVIOUS);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt equals to DEFAULT_CALCULATED_AT
        defaultPerformanceScoreShouldBeFound("calculatedAt.equals=" + DEFAULT_CALCULATED_AT);

        // Get all the performanceScoreList where calculatedAt equals to UPDATED_CALCULATED_AT
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.equals=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt in DEFAULT_CALCULATED_AT or UPDATED_CALCULATED_AT
        defaultPerformanceScoreShouldBeFound("calculatedAt.in=" + DEFAULT_CALCULATED_AT + "," + UPDATED_CALCULATED_AT);

        // Get all the performanceScoreList where calculatedAt equals to UPDATED_CALCULATED_AT
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.in=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt is not null
        defaultPerformanceScoreShouldBeFound("calculatedAt.specified=true");

        // Get all the performanceScoreList where calculatedAt is null
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt is greater than or equal to DEFAULT_CALCULATED_AT
        defaultPerformanceScoreShouldBeFound("calculatedAt.greaterThanOrEqual=" + DEFAULT_CALCULATED_AT);

        // Get all the performanceScoreList where calculatedAt is greater than or equal to UPDATED_CALCULATED_AT
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.greaterThanOrEqual=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt is less than or equal to DEFAULT_CALCULATED_AT
        defaultPerformanceScoreShouldBeFound("calculatedAt.lessThanOrEqual=" + DEFAULT_CALCULATED_AT);

        // Get all the performanceScoreList where calculatedAt is less than or equal to SMALLER_CALCULATED_AT
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.lessThanOrEqual=" + SMALLER_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt is less than DEFAULT_CALCULATED_AT
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.lessThan=" + DEFAULT_CALCULATED_AT);

        // Get all the performanceScoreList where calculatedAt is less than UPDATED_CALCULATED_AT
        defaultPerformanceScoreShouldBeFound("calculatedAt.lessThan=" + UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void getAllPerformanceScoresByCalculatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        // Get all the performanceScoreList where calculatedAt is greater than DEFAULT_CALCULATED_AT
        defaultPerformanceScoreShouldNotBeFound("calculatedAt.greaterThan=" + DEFAULT_CALCULATED_AT);

        // Get all the performanceScoreList where calculatedAt is greater than SMALLER_CALCULATED_AT
        defaultPerformanceScoreShouldBeFound("calculatedAt.greaterThan=" + SMALLER_CALCULATED_AT);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultPerformanceScoreShouldBeFound(String filter) throws Exception {
        restPerformanceScoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(performanceScore.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].userLogin").value(hasItem(DEFAULT_USER_LOGIN)))
            .andExpect(jsonPath("$.[*].period").value(hasItem(DEFAULT_PERIOD)))
            .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
            .andExpect(jsonPath("$.[*].classification").value(hasItem(DEFAULT_CLASSIFICATION.toString())))
            .andExpect(jsonPath("$.[*].breakdownJson").value(hasItem(DEFAULT_BREAKDOWN_JSON.toString())))
            .andExpect(jsonPath("$.[*].deltaVsPrevious").value(hasItem(DEFAULT_DELTA_VS_PREVIOUS)))
            .andExpect(jsonPath("$.[*].calculatedAt").value(hasItem(sameInstant(DEFAULT_CALCULATED_AT))));

        // Check, that the count call also returns 1
        restPerformanceScoreMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultPerformanceScoreShouldNotBeFound(String filter) throws Exception {
        restPerformanceScoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restPerformanceScoreMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingPerformanceScore() throws Exception {
        // Get the performanceScore
        restPerformanceScoreMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPerformanceScore() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();

        // Update the performanceScore
        PerformanceScore updatedPerformanceScore = performanceScoreRepository.findById(performanceScore.getId()).get();
        // Disconnect from session so that the updates on updatedPerformanceScore are not directly saved in db
        em.detach(updatedPerformanceScore);
        updatedPerformanceScore
            .tenantId(UPDATED_TENANT_ID)
            .userLogin(UPDATED_USER_LOGIN)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .deltaVsPrevious(UPDATED_DELTA_VS_PREVIOUS)
            .calculatedAt(UPDATED_CALCULATED_AT);
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(updatedPerformanceScore);

        restPerformanceScoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, performanceScoreDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isOk());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
        PerformanceScore testPerformanceScore = performanceScoreList.get(performanceScoreList.size() - 1);
        assertThat(testPerformanceScore.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testPerformanceScore.getUserLogin()).isEqualTo(UPDATED_USER_LOGIN);
        assertThat(testPerformanceScore.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testPerformanceScore.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testPerformanceScore.getClassification()).isEqualTo(UPDATED_CLASSIFICATION);
        assertThat(testPerformanceScore.getBreakdownJson()).isEqualTo(UPDATED_BREAKDOWN_JSON);
        assertThat(testPerformanceScore.getDeltaVsPrevious()).isEqualTo(UPDATED_DELTA_VS_PREVIOUS);
        assertThat(testPerformanceScore.getCalculatedAt()).isEqualTo(UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void putNonExistingPerformanceScore() throws Exception {
        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();
        performanceScore.setId(count.incrementAndGet());

        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPerformanceScoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, performanceScoreDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPerformanceScore() throws Exception {
        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();
        performanceScore.setId(count.incrementAndGet());

        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPerformanceScoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPerformanceScore() throws Exception {
        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();
        performanceScore.setId(count.incrementAndGet());

        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPerformanceScoreMockMvc
            .perform(
                put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePerformanceScoreWithPatch() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();

        // Update the performanceScore using partial update
        PerformanceScore partialUpdatedPerformanceScore = new PerformanceScore();
        partialUpdatedPerformanceScore.setId(performanceScore.getId());

        partialUpdatedPerformanceScore
            .tenantId(UPDATED_TENANT_ID)
            .score(UPDATED_SCORE)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .deltaVsPrevious(UPDATED_DELTA_VS_PREVIOUS)
            .calculatedAt(UPDATED_CALCULATED_AT);

        restPerformanceScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPerformanceScore.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedPerformanceScore))
            )
            .andExpect(status().isOk());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
        PerformanceScore testPerformanceScore = performanceScoreList.get(performanceScoreList.size() - 1);
        assertThat(testPerformanceScore.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testPerformanceScore.getUserLogin()).isEqualTo(DEFAULT_USER_LOGIN);
        assertThat(testPerformanceScore.getPeriod()).isEqualTo(DEFAULT_PERIOD);
        assertThat(testPerformanceScore.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testPerformanceScore.getClassification()).isEqualTo(DEFAULT_CLASSIFICATION);
        assertThat(testPerformanceScore.getBreakdownJson()).isEqualTo(UPDATED_BREAKDOWN_JSON);
        assertThat(testPerformanceScore.getDeltaVsPrevious()).isEqualTo(UPDATED_DELTA_VS_PREVIOUS);
        assertThat(testPerformanceScore.getCalculatedAt()).isEqualTo(UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void fullUpdatePerformanceScoreWithPatch() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();

        // Update the performanceScore using partial update
        PerformanceScore partialUpdatedPerformanceScore = new PerformanceScore();
        partialUpdatedPerformanceScore.setId(performanceScore.getId());

        partialUpdatedPerformanceScore
            .tenantId(UPDATED_TENANT_ID)
            .userLogin(UPDATED_USER_LOGIN)
            .period(UPDATED_PERIOD)
            .score(UPDATED_SCORE)
            .classification(UPDATED_CLASSIFICATION)
            .breakdownJson(UPDATED_BREAKDOWN_JSON)
            .deltaVsPrevious(UPDATED_DELTA_VS_PREVIOUS)
            .calculatedAt(UPDATED_CALCULATED_AT);

        restPerformanceScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPerformanceScore.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedPerformanceScore))
            )
            .andExpect(status().isOk());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
        PerformanceScore testPerformanceScore = performanceScoreList.get(performanceScoreList.size() - 1);
        assertThat(testPerformanceScore.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testPerformanceScore.getUserLogin()).isEqualTo(UPDATED_USER_LOGIN);
        assertThat(testPerformanceScore.getPeriod()).isEqualTo(UPDATED_PERIOD);
        assertThat(testPerformanceScore.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testPerformanceScore.getClassification()).isEqualTo(UPDATED_CLASSIFICATION);
        assertThat(testPerformanceScore.getBreakdownJson()).isEqualTo(UPDATED_BREAKDOWN_JSON);
        assertThat(testPerformanceScore.getDeltaVsPrevious()).isEqualTo(UPDATED_DELTA_VS_PREVIOUS);
        assertThat(testPerformanceScore.getCalculatedAt()).isEqualTo(UPDATED_CALCULATED_AT);
    }

    @Test
    @Transactional
    void patchNonExistingPerformanceScore() throws Exception {
        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();
        performanceScore.setId(count.incrementAndGet());

        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPerformanceScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, performanceScoreDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPerformanceScore() throws Exception {
        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();
        performanceScore.setId(count.incrementAndGet());

        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPerformanceScoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPerformanceScore() throws Exception {
        int databaseSizeBeforeUpdate = performanceScoreRepository.findAll().size();
        performanceScore.setId(count.incrementAndGet());

        // Create the PerformanceScore
        PerformanceScoreDTO performanceScoreDTO = performanceScoreMapper.toDto(performanceScore);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPerformanceScoreMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(performanceScoreDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PerformanceScore in the database
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePerformanceScore() throws Exception {
        // Initialize the database
        performanceScoreRepository.saveAndFlush(performanceScore);

        int databaseSizeBeforeDelete = performanceScoreRepository.findAll().size();

        // Delete the performanceScore
        restPerformanceScoreMockMvc
            .perform(delete(ENTITY_API_URL_ID, performanceScore.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<PerformanceScore> performanceScoreList = performanceScoreRepository.findAll();
        assertThat(performanceScoreList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
