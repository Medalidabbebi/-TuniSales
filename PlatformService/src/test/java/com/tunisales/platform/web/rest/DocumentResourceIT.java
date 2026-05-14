package com.tunisales.platform.web.rest;

import static com.tunisales.platform.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tunisales.platform.IntegrationTest;
import com.tunisales.platform.domain.Document;
import com.tunisales.platform.domain.enumeration.DocumentEntityType;
import com.tunisales.platform.domain.enumeration.DocumentType;
import com.tunisales.platform.repository.DocumentRepository;
import com.tunisales.platform.service.criteria.DocumentCriteria;
import com.tunisales.platform.service.dto.DocumentDTO;
import com.tunisales.platform.service.mapper.DocumentMapper;
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
 * Integration tests for the {@link DocumentResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DocumentResourceIT {

    private static final Long DEFAULT_TENANT_ID = 1L;
    private static final Long UPDATED_TENANT_ID = 2L;
    private static final Long SMALLER_TENANT_ID = 1L - 1L;

    private static final DocumentEntityType DEFAULT_ENTITY_TYPE = DocumentEntityType.ORDER;
    private static final DocumentEntityType UPDATED_ENTITY_TYPE = DocumentEntityType.DELIVERY;

    private static final String DEFAULT_ENTITY_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY_ID = "BBBBBBBBBB";

    private static final DocumentType DEFAULT_DOC_TYPE = DocumentType.DELIVERY_NOTE;
    private static final DocumentType UPDATED_DOC_TYPE = DocumentType.INVOICE;

    private static final String DEFAULT_FILENAME = "AAAAAAAAAA";
    private static final String UPDATED_FILENAME = "BBBBBBBBBB";

    private static final String DEFAULT_STORAGE_URL = "AAAAAAAAAA";
    private static final String UPDATED_STORAGE_URL = "BBBBBBBBBB";

    private static final String DEFAULT_MIME_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_MIME_TYPE = "BBBBBBBBBB";

    private static final Long DEFAULT_SIZE_BYTES = 0L;
    private static final Long UPDATED_SIZE_BYTES = 1L;
    private static final Long SMALLER_SIZE_BYTES = 0L - 1L;

    private static final String DEFAULT_UPLOADED_BY_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_UPLOADED_BY_LOGIN = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_CREATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final ZonedDateTime DEFAULT_UPDATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_UPDATED_AT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final ZonedDateTime SMALLER_UPDATED_AT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(-1L), ZoneOffset.UTC);

    private static final String ENTITY_API_URL = "/api/documents";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentMapper documentMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDocumentMockMvc;

    private Document document;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Document createEntity(EntityManager em) {
        Document document = new Document()
            .tenantId(DEFAULT_TENANT_ID)
            .entityType(DEFAULT_ENTITY_TYPE)
            .entityId(DEFAULT_ENTITY_ID)
            .docType(DEFAULT_DOC_TYPE)
            .filename(DEFAULT_FILENAME)
            .storageUrl(DEFAULT_STORAGE_URL)
            .mimeType(DEFAULT_MIME_TYPE)
            .sizeBytes(DEFAULT_SIZE_BYTES)
            .uploadedByLogin(DEFAULT_UPLOADED_BY_LOGIN)
            .createdAt(DEFAULT_CREATED_AT)
            .updatedAt(DEFAULT_UPDATED_AT);
        return document;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Document createUpdatedEntity(EntityManager em) {
        Document document = new Document()
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .entityId(UPDATED_ENTITY_ID)
            .docType(UPDATED_DOC_TYPE)
            .filename(UPDATED_FILENAME)
            .storageUrl(UPDATED_STORAGE_URL)
            .mimeType(UPDATED_MIME_TYPE)
            .sizeBytes(UPDATED_SIZE_BYTES)
            .uploadedByLogin(UPDATED_UPLOADED_BY_LOGIN)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        return document;
    }

    @BeforeEach
    public void initTest() {
        document = createEntity(em);
    }

    @Test
    @Transactional
    void createDocument() throws Exception {
        int databaseSizeBeforeCreate = documentRepository.findAll().size();
        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);
        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isCreated());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeCreate + 1);
        Document testDocument = documentList.get(documentList.size() - 1);
        assertThat(testDocument.getTenantId()).isEqualTo(DEFAULT_TENANT_ID);
        assertThat(testDocument.getEntityType()).isEqualTo(DEFAULT_ENTITY_TYPE);
        assertThat(testDocument.getEntityId()).isEqualTo(DEFAULT_ENTITY_ID);
        assertThat(testDocument.getDocType()).isEqualTo(DEFAULT_DOC_TYPE);
        assertThat(testDocument.getFilename()).isEqualTo(DEFAULT_FILENAME);
        assertThat(testDocument.getStorageUrl()).isEqualTo(DEFAULT_STORAGE_URL);
        assertThat(testDocument.getMimeType()).isEqualTo(DEFAULT_MIME_TYPE);
        assertThat(testDocument.getSizeBytes()).isEqualTo(DEFAULT_SIZE_BYTES);
        assertThat(testDocument.getUploadedByLogin()).isEqualTo(DEFAULT_UPLOADED_BY_LOGIN);
        assertThat(testDocument.getCreatedAt()).isEqualTo(DEFAULT_CREATED_AT);
        assertThat(testDocument.getUpdatedAt()).isEqualTo(DEFAULT_UPDATED_AT);
    }

    @Test
    @Transactional
    void createDocumentWithExistingId() throws Exception {
        // Create the Document with an existing ID
        document.setId(1L);
        DocumentDTO documentDTO = documentMapper.toDto(document);

        int databaseSizeBeforeCreate = documentRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEntityTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = documentRepository.findAll().size();
        // set the field null
        document.setEntityType(null);

        // Create the Document, which fails.
        DocumentDTO documentDTO = documentMapper.toDto(document);

        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEntityIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = documentRepository.findAll().size();
        // set the field null
        document.setEntityId(null);

        // Create the Document, which fails.
        DocumentDTO documentDTO = documentMapper.toDto(document);

        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDocTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = documentRepository.findAll().size();
        // set the field null
        document.setDocType(null);

        // Create the Document, which fails.
        DocumentDTO documentDTO = documentMapper.toDto(document);

        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFilenameIsRequired() throws Exception {
        int databaseSizeBeforeTest = documentRepository.findAll().size();
        // set the field null
        document.setFilename(null);

        // Create the Document, which fails.
        DocumentDTO documentDTO = documentMapper.toDto(document);

        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStorageUrlIsRequired() throws Exception {
        int databaseSizeBeforeTest = documentRepository.findAll().size();
        // set the field null
        document.setStorageUrl(null);

        // Create the Document, which fails.
        DocumentDTO documentDTO = documentMapper.toDto(document);

        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        int databaseSizeBeforeTest = documentRepository.findAll().size();
        // set the field null
        document.setCreatedAt(null);

        // Create the Document, which fails.
        DocumentDTO documentDTO = documentMapper.toDto(document);

        restDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isBadRequest());

        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDocuments() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList
        restDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(document.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].entityType").value(hasItem(DEFAULT_ENTITY_TYPE.toString())))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID)))
            .andExpect(jsonPath("$.[*].docType").value(hasItem(DEFAULT_DOC_TYPE.toString())))
            .andExpect(jsonPath("$.[*].filename").value(hasItem(DEFAULT_FILENAME)))
            .andExpect(jsonPath("$.[*].storageUrl").value(hasItem(DEFAULT_STORAGE_URL)))
            .andExpect(jsonPath("$.[*].mimeType").value(hasItem(DEFAULT_MIME_TYPE)))
            .andExpect(jsonPath("$.[*].sizeBytes").value(hasItem(DEFAULT_SIZE_BYTES.intValue())))
            .andExpect(jsonPath("$.[*].uploadedByLogin").value(hasItem(DEFAULT_UPLOADED_BY_LOGIN)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))))
            .andExpect(jsonPath("$.[*].updatedAt").value(hasItem(sameInstant(DEFAULT_UPDATED_AT))));
    }

    @Test
    @Transactional
    void getDocument() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get the document
        restDocumentMockMvc
            .perform(get(ENTITY_API_URL_ID, document.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(document.getId().intValue()))
            .andExpect(jsonPath("$.tenantId").value(DEFAULT_TENANT_ID.intValue()))
            .andExpect(jsonPath("$.entityType").value(DEFAULT_ENTITY_TYPE.toString()))
            .andExpect(jsonPath("$.entityId").value(DEFAULT_ENTITY_ID))
            .andExpect(jsonPath("$.docType").value(DEFAULT_DOC_TYPE.toString()))
            .andExpect(jsonPath("$.filename").value(DEFAULT_FILENAME))
            .andExpect(jsonPath("$.storageUrl").value(DEFAULT_STORAGE_URL))
            .andExpect(jsonPath("$.mimeType").value(DEFAULT_MIME_TYPE))
            .andExpect(jsonPath("$.sizeBytes").value(DEFAULT_SIZE_BYTES.intValue()))
            .andExpect(jsonPath("$.uploadedByLogin").value(DEFAULT_UPLOADED_BY_LOGIN))
            .andExpect(jsonPath("$.createdAt").value(sameInstant(DEFAULT_CREATED_AT)))
            .andExpect(jsonPath("$.updatedAt").value(sameInstant(DEFAULT_UPDATED_AT)));
    }

    @Test
    @Transactional
    void getDocumentsByIdFiltering() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        Long id = document.getId();

        defaultDocumentShouldBeFound("id.equals=" + id);
        defaultDocumentShouldNotBeFound("id.notEquals=" + id);

        defaultDocumentShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultDocumentShouldNotBeFound("id.greaterThan=" + id);

        defaultDocumentShouldBeFound("id.lessThanOrEqual=" + id);
        defaultDocumentShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId equals to DEFAULT_TENANT_ID
        defaultDocumentShouldBeFound("tenantId.equals=" + DEFAULT_TENANT_ID);

        // Get all the documentList where tenantId equals to UPDATED_TENANT_ID
        defaultDocumentShouldNotBeFound("tenantId.equals=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId in DEFAULT_TENANT_ID or UPDATED_TENANT_ID
        defaultDocumentShouldBeFound("tenantId.in=" + DEFAULT_TENANT_ID + "," + UPDATED_TENANT_ID);

        // Get all the documentList where tenantId equals to UPDATED_TENANT_ID
        defaultDocumentShouldNotBeFound("tenantId.in=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId is not null
        defaultDocumentShouldBeFound("tenantId.specified=true");

        // Get all the documentList where tenantId is null
        defaultDocumentShouldNotBeFound("tenantId.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId is greater than or equal to DEFAULT_TENANT_ID
        defaultDocumentShouldBeFound("tenantId.greaterThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the documentList where tenantId is greater than or equal to UPDATED_TENANT_ID
        defaultDocumentShouldNotBeFound("tenantId.greaterThanOrEqual=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId is less than or equal to DEFAULT_TENANT_ID
        defaultDocumentShouldBeFound("tenantId.lessThanOrEqual=" + DEFAULT_TENANT_ID);

        // Get all the documentList where tenantId is less than or equal to SMALLER_TENANT_ID
        defaultDocumentShouldNotBeFound("tenantId.lessThanOrEqual=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsLessThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId is less than DEFAULT_TENANT_ID
        defaultDocumentShouldNotBeFound("tenantId.lessThan=" + DEFAULT_TENANT_ID);

        // Get all the documentList where tenantId is less than UPDATED_TENANT_ID
        defaultDocumentShouldBeFound("tenantId.lessThan=" + UPDATED_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByTenantIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where tenantId is greater than DEFAULT_TENANT_ID
        defaultDocumentShouldNotBeFound("tenantId.greaterThan=" + DEFAULT_TENANT_ID);

        // Get all the documentList where tenantId is greater than SMALLER_TENANT_ID
        defaultDocumentShouldBeFound("tenantId.greaterThan=" + SMALLER_TENANT_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityType equals to DEFAULT_ENTITY_TYPE
        defaultDocumentShouldBeFound("entityType.equals=" + DEFAULT_ENTITY_TYPE);

        // Get all the documentList where entityType equals to UPDATED_ENTITY_TYPE
        defaultDocumentShouldNotBeFound("entityType.equals=" + UPDATED_ENTITY_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityTypeIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityType in DEFAULT_ENTITY_TYPE or UPDATED_ENTITY_TYPE
        defaultDocumentShouldBeFound("entityType.in=" + DEFAULT_ENTITY_TYPE + "," + UPDATED_ENTITY_TYPE);

        // Get all the documentList where entityType equals to UPDATED_ENTITY_TYPE
        defaultDocumentShouldNotBeFound("entityType.in=" + UPDATED_ENTITY_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityType is not null
        defaultDocumentShouldBeFound("entityType.specified=true");

        // Get all the documentList where entityType is null
        defaultDocumentShouldNotBeFound("entityType.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityIdIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityId equals to DEFAULT_ENTITY_ID
        defaultDocumentShouldBeFound("entityId.equals=" + DEFAULT_ENTITY_ID);

        // Get all the documentList where entityId equals to UPDATED_ENTITY_ID
        defaultDocumentShouldNotBeFound("entityId.equals=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityIdIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityId in DEFAULT_ENTITY_ID or UPDATED_ENTITY_ID
        defaultDocumentShouldBeFound("entityId.in=" + DEFAULT_ENTITY_ID + "," + UPDATED_ENTITY_ID);

        // Get all the documentList where entityId equals to UPDATED_ENTITY_ID
        defaultDocumentShouldNotBeFound("entityId.in=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityId is not null
        defaultDocumentShouldBeFound("entityId.specified=true");

        // Get all the documentList where entityId is null
        defaultDocumentShouldNotBeFound("entityId.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityIdContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityId contains DEFAULT_ENTITY_ID
        defaultDocumentShouldBeFound("entityId.contains=" + DEFAULT_ENTITY_ID);

        // Get all the documentList where entityId contains UPDATED_ENTITY_ID
        defaultDocumentShouldNotBeFound("entityId.contains=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByEntityIdNotContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where entityId does not contain DEFAULT_ENTITY_ID
        defaultDocumentShouldNotBeFound("entityId.doesNotContain=" + DEFAULT_ENTITY_ID);

        // Get all the documentList where entityId does not contain UPDATED_ENTITY_ID
        defaultDocumentShouldBeFound("entityId.doesNotContain=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllDocumentsByDocTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where docType equals to DEFAULT_DOC_TYPE
        defaultDocumentShouldBeFound("docType.equals=" + DEFAULT_DOC_TYPE);

        // Get all the documentList where docType equals to UPDATED_DOC_TYPE
        defaultDocumentShouldNotBeFound("docType.equals=" + UPDATED_DOC_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByDocTypeIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where docType in DEFAULT_DOC_TYPE or UPDATED_DOC_TYPE
        defaultDocumentShouldBeFound("docType.in=" + DEFAULT_DOC_TYPE + "," + UPDATED_DOC_TYPE);

        // Get all the documentList where docType equals to UPDATED_DOC_TYPE
        defaultDocumentShouldNotBeFound("docType.in=" + UPDATED_DOC_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByDocTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where docType is not null
        defaultDocumentShouldBeFound("docType.specified=true");

        // Get all the documentList where docType is null
        defaultDocumentShouldNotBeFound("docType.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByFilenameIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where filename equals to DEFAULT_FILENAME
        defaultDocumentShouldBeFound("filename.equals=" + DEFAULT_FILENAME);

        // Get all the documentList where filename equals to UPDATED_FILENAME
        defaultDocumentShouldNotBeFound("filename.equals=" + UPDATED_FILENAME);
    }

    @Test
    @Transactional
    void getAllDocumentsByFilenameIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where filename in DEFAULT_FILENAME or UPDATED_FILENAME
        defaultDocumentShouldBeFound("filename.in=" + DEFAULT_FILENAME + "," + UPDATED_FILENAME);

        // Get all the documentList where filename equals to UPDATED_FILENAME
        defaultDocumentShouldNotBeFound("filename.in=" + UPDATED_FILENAME);
    }

    @Test
    @Transactional
    void getAllDocumentsByFilenameIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where filename is not null
        defaultDocumentShouldBeFound("filename.specified=true");

        // Get all the documentList where filename is null
        defaultDocumentShouldNotBeFound("filename.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByFilenameContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where filename contains DEFAULT_FILENAME
        defaultDocumentShouldBeFound("filename.contains=" + DEFAULT_FILENAME);

        // Get all the documentList where filename contains UPDATED_FILENAME
        defaultDocumentShouldNotBeFound("filename.contains=" + UPDATED_FILENAME);
    }

    @Test
    @Transactional
    void getAllDocumentsByFilenameNotContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where filename does not contain DEFAULT_FILENAME
        defaultDocumentShouldNotBeFound("filename.doesNotContain=" + DEFAULT_FILENAME);

        // Get all the documentList where filename does not contain UPDATED_FILENAME
        defaultDocumentShouldBeFound("filename.doesNotContain=" + UPDATED_FILENAME);
    }

    @Test
    @Transactional
    void getAllDocumentsByStorageUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where storageUrl equals to DEFAULT_STORAGE_URL
        defaultDocumentShouldBeFound("storageUrl.equals=" + DEFAULT_STORAGE_URL);

        // Get all the documentList where storageUrl equals to UPDATED_STORAGE_URL
        defaultDocumentShouldNotBeFound("storageUrl.equals=" + UPDATED_STORAGE_URL);
    }

    @Test
    @Transactional
    void getAllDocumentsByStorageUrlIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where storageUrl in DEFAULT_STORAGE_URL or UPDATED_STORAGE_URL
        defaultDocumentShouldBeFound("storageUrl.in=" + DEFAULT_STORAGE_URL + "," + UPDATED_STORAGE_URL);

        // Get all the documentList where storageUrl equals to UPDATED_STORAGE_URL
        defaultDocumentShouldNotBeFound("storageUrl.in=" + UPDATED_STORAGE_URL);
    }

    @Test
    @Transactional
    void getAllDocumentsByStorageUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where storageUrl is not null
        defaultDocumentShouldBeFound("storageUrl.specified=true");

        // Get all the documentList where storageUrl is null
        defaultDocumentShouldNotBeFound("storageUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByStorageUrlContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where storageUrl contains DEFAULT_STORAGE_URL
        defaultDocumentShouldBeFound("storageUrl.contains=" + DEFAULT_STORAGE_URL);

        // Get all the documentList where storageUrl contains UPDATED_STORAGE_URL
        defaultDocumentShouldNotBeFound("storageUrl.contains=" + UPDATED_STORAGE_URL);
    }

    @Test
    @Transactional
    void getAllDocumentsByStorageUrlNotContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where storageUrl does not contain DEFAULT_STORAGE_URL
        defaultDocumentShouldNotBeFound("storageUrl.doesNotContain=" + DEFAULT_STORAGE_URL);

        // Get all the documentList where storageUrl does not contain UPDATED_STORAGE_URL
        defaultDocumentShouldBeFound("storageUrl.doesNotContain=" + UPDATED_STORAGE_URL);
    }

    @Test
    @Transactional
    void getAllDocumentsByMimeTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where mimeType equals to DEFAULT_MIME_TYPE
        defaultDocumentShouldBeFound("mimeType.equals=" + DEFAULT_MIME_TYPE);

        // Get all the documentList where mimeType equals to UPDATED_MIME_TYPE
        defaultDocumentShouldNotBeFound("mimeType.equals=" + UPDATED_MIME_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByMimeTypeIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where mimeType in DEFAULT_MIME_TYPE or UPDATED_MIME_TYPE
        defaultDocumentShouldBeFound("mimeType.in=" + DEFAULT_MIME_TYPE + "," + UPDATED_MIME_TYPE);

        // Get all the documentList where mimeType equals to UPDATED_MIME_TYPE
        defaultDocumentShouldNotBeFound("mimeType.in=" + UPDATED_MIME_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByMimeTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where mimeType is not null
        defaultDocumentShouldBeFound("mimeType.specified=true");

        // Get all the documentList where mimeType is null
        defaultDocumentShouldNotBeFound("mimeType.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByMimeTypeContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where mimeType contains DEFAULT_MIME_TYPE
        defaultDocumentShouldBeFound("mimeType.contains=" + DEFAULT_MIME_TYPE);

        // Get all the documentList where mimeType contains UPDATED_MIME_TYPE
        defaultDocumentShouldNotBeFound("mimeType.contains=" + UPDATED_MIME_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsByMimeTypeNotContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where mimeType does not contain DEFAULT_MIME_TYPE
        defaultDocumentShouldNotBeFound("mimeType.doesNotContain=" + DEFAULT_MIME_TYPE);

        // Get all the documentList where mimeType does not contain UPDATED_MIME_TYPE
        defaultDocumentShouldBeFound("mimeType.doesNotContain=" + UPDATED_MIME_TYPE);
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes equals to DEFAULT_SIZE_BYTES
        defaultDocumentShouldBeFound("sizeBytes.equals=" + DEFAULT_SIZE_BYTES);

        // Get all the documentList where sizeBytes equals to UPDATED_SIZE_BYTES
        defaultDocumentShouldNotBeFound("sizeBytes.equals=" + UPDATED_SIZE_BYTES);
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes in DEFAULT_SIZE_BYTES or UPDATED_SIZE_BYTES
        defaultDocumentShouldBeFound("sizeBytes.in=" + DEFAULT_SIZE_BYTES + "," + UPDATED_SIZE_BYTES);

        // Get all the documentList where sizeBytes equals to UPDATED_SIZE_BYTES
        defaultDocumentShouldNotBeFound("sizeBytes.in=" + UPDATED_SIZE_BYTES);
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes is not null
        defaultDocumentShouldBeFound("sizeBytes.specified=true");

        // Get all the documentList where sizeBytes is null
        defaultDocumentShouldNotBeFound("sizeBytes.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes is greater than or equal to DEFAULT_SIZE_BYTES
        defaultDocumentShouldBeFound("sizeBytes.greaterThanOrEqual=" + DEFAULT_SIZE_BYTES);

        // Get all the documentList where sizeBytes is greater than or equal to UPDATED_SIZE_BYTES
        defaultDocumentShouldNotBeFound("sizeBytes.greaterThanOrEqual=" + UPDATED_SIZE_BYTES);
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes is less than or equal to DEFAULT_SIZE_BYTES
        defaultDocumentShouldBeFound("sizeBytes.lessThanOrEqual=" + DEFAULT_SIZE_BYTES);

        // Get all the documentList where sizeBytes is less than or equal to SMALLER_SIZE_BYTES
        defaultDocumentShouldNotBeFound("sizeBytes.lessThanOrEqual=" + SMALLER_SIZE_BYTES);
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsLessThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes is less than DEFAULT_SIZE_BYTES
        defaultDocumentShouldNotBeFound("sizeBytes.lessThan=" + DEFAULT_SIZE_BYTES);

        // Get all the documentList where sizeBytes is less than UPDATED_SIZE_BYTES
        defaultDocumentShouldBeFound("sizeBytes.lessThan=" + UPDATED_SIZE_BYTES);
    }

    @Test
    @Transactional
    void getAllDocumentsBySizeBytesIsGreaterThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where sizeBytes is greater than DEFAULT_SIZE_BYTES
        defaultDocumentShouldNotBeFound("sizeBytes.greaterThan=" + DEFAULT_SIZE_BYTES);

        // Get all the documentList where sizeBytes is greater than SMALLER_SIZE_BYTES
        defaultDocumentShouldBeFound("sizeBytes.greaterThan=" + SMALLER_SIZE_BYTES);
    }

    @Test
    @Transactional
    void getAllDocumentsByUploadedByLoginIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where uploadedByLogin equals to DEFAULT_UPLOADED_BY_LOGIN
        defaultDocumentShouldBeFound("uploadedByLogin.equals=" + DEFAULT_UPLOADED_BY_LOGIN);

        // Get all the documentList where uploadedByLogin equals to UPDATED_UPLOADED_BY_LOGIN
        defaultDocumentShouldNotBeFound("uploadedByLogin.equals=" + UPDATED_UPLOADED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllDocumentsByUploadedByLoginIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where uploadedByLogin in DEFAULT_UPLOADED_BY_LOGIN or UPDATED_UPLOADED_BY_LOGIN
        defaultDocumentShouldBeFound("uploadedByLogin.in=" + DEFAULT_UPLOADED_BY_LOGIN + "," + UPDATED_UPLOADED_BY_LOGIN);

        // Get all the documentList where uploadedByLogin equals to UPDATED_UPLOADED_BY_LOGIN
        defaultDocumentShouldNotBeFound("uploadedByLogin.in=" + UPDATED_UPLOADED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllDocumentsByUploadedByLoginIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where uploadedByLogin is not null
        defaultDocumentShouldBeFound("uploadedByLogin.specified=true");

        // Get all the documentList where uploadedByLogin is null
        defaultDocumentShouldNotBeFound("uploadedByLogin.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByUploadedByLoginContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where uploadedByLogin contains DEFAULT_UPLOADED_BY_LOGIN
        defaultDocumentShouldBeFound("uploadedByLogin.contains=" + DEFAULT_UPLOADED_BY_LOGIN);

        // Get all the documentList where uploadedByLogin contains UPDATED_UPLOADED_BY_LOGIN
        defaultDocumentShouldNotBeFound("uploadedByLogin.contains=" + UPDATED_UPLOADED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllDocumentsByUploadedByLoginNotContainsSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where uploadedByLogin does not contain DEFAULT_UPLOADED_BY_LOGIN
        defaultDocumentShouldNotBeFound("uploadedByLogin.doesNotContain=" + DEFAULT_UPLOADED_BY_LOGIN);

        // Get all the documentList where uploadedByLogin does not contain UPDATED_UPLOADED_BY_LOGIN
        defaultDocumentShouldBeFound("uploadedByLogin.doesNotContain=" + UPDATED_UPLOADED_BY_LOGIN);
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt equals to DEFAULT_CREATED_AT
        defaultDocumentShouldBeFound("createdAt.equals=" + DEFAULT_CREATED_AT);

        // Get all the documentList where createdAt equals to UPDATED_CREATED_AT
        defaultDocumentShouldNotBeFound("createdAt.equals=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt in DEFAULT_CREATED_AT or UPDATED_CREATED_AT
        defaultDocumentShouldBeFound("createdAt.in=" + DEFAULT_CREATED_AT + "," + UPDATED_CREATED_AT);

        // Get all the documentList where createdAt equals to UPDATED_CREATED_AT
        defaultDocumentShouldNotBeFound("createdAt.in=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt is not null
        defaultDocumentShouldBeFound("createdAt.specified=true");

        // Get all the documentList where createdAt is null
        defaultDocumentShouldNotBeFound("createdAt.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt is greater than or equal to DEFAULT_CREATED_AT
        defaultDocumentShouldBeFound("createdAt.greaterThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the documentList where createdAt is greater than or equal to UPDATED_CREATED_AT
        defaultDocumentShouldNotBeFound("createdAt.greaterThanOrEqual=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt is less than or equal to DEFAULT_CREATED_AT
        defaultDocumentShouldBeFound("createdAt.lessThanOrEqual=" + DEFAULT_CREATED_AT);

        // Get all the documentList where createdAt is less than or equal to SMALLER_CREATED_AT
        defaultDocumentShouldNotBeFound("createdAt.lessThanOrEqual=" + SMALLER_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt is less than DEFAULT_CREATED_AT
        defaultDocumentShouldNotBeFound("createdAt.lessThan=" + DEFAULT_CREATED_AT);

        // Get all the documentList where createdAt is less than UPDATED_CREATED_AT
        defaultDocumentShouldBeFound("createdAt.lessThan=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByCreatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where createdAt is greater than DEFAULT_CREATED_AT
        defaultDocumentShouldNotBeFound("createdAt.greaterThan=" + DEFAULT_CREATED_AT);

        // Get all the documentList where createdAt is greater than SMALLER_CREATED_AT
        defaultDocumentShouldBeFound("createdAt.greaterThan=" + SMALLER_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt equals to DEFAULT_UPDATED_AT
        defaultDocumentShouldBeFound("updatedAt.equals=" + DEFAULT_UPDATED_AT);

        // Get all the documentList where updatedAt equals to UPDATED_UPDATED_AT
        defaultDocumentShouldNotBeFound("updatedAt.equals=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt in DEFAULT_UPDATED_AT or UPDATED_UPDATED_AT
        defaultDocumentShouldBeFound("updatedAt.in=" + DEFAULT_UPDATED_AT + "," + UPDATED_UPDATED_AT);

        // Get all the documentList where updatedAt equals to UPDATED_UPDATED_AT
        defaultDocumentShouldNotBeFound("updatedAt.in=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt is not null
        defaultDocumentShouldBeFound("updatedAt.specified=true");

        // Get all the documentList where updatedAt is null
        defaultDocumentShouldNotBeFound("updatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt is greater than or equal to DEFAULT_UPDATED_AT
        defaultDocumentShouldBeFound("updatedAt.greaterThanOrEqual=" + DEFAULT_UPDATED_AT);

        // Get all the documentList where updatedAt is greater than or equal to UPDATED_UPDATED_AT
        defaultDocumentShouldNotBeFound("updatedAt.greaterThanOrEqual=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt is less than or equal to DEFAULT_UPDATED_AT
        defaultDocumentShouldBeFound("updatedAt.lessThanOrEqual=" + DEFAULT_UPDATED_AT);

        // Get all the documentList where updatedAt is less than or equal to SMALLER_UPDATED_AT
        defaultDocumentShouldNotBeFound("updatedAt.lessThanOrEqual=" + SMALLER_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsLessThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt is less than DEFAULT_UPDATED_AT
        defaultDocumentShouldNotBeFound("updatedAt.lessThan=" + DEFAULT_UPDATED_AT);

        // Get all the documentList where updatedAt is less than UPDATED_UPDATED_AT
        defaultDocumentShouldBeFound("updatedAt.lessThan=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllDocumentsByUpdatedAtIsGreaterThanSomething() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        // Get all the documentList where updatedAt is greater than DEFAULT_UPDATED_AT
        defaultDocumentShouldNotBeFound("updatedAt.greaterThan=" + DEFAULT_UPDATED_AT);

        // Get all the documentList where updatedAt is greater than SMALLER_UPDATED_AT
        defaultDocumentShouldBeFound("updatedAt.greaterThan=" + SMALLER_UPDATED_AT);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultDocumentShouldBeFound(String filter) throws Exception {
        restDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(document.getId().intValue())))
            .andExpect(jsonPath("$.[*].tenantId").value(hasItem(DEFAULT_TENANT_ID.intValue())))
            .andExpect(jsonPath("$.[*].entityType").value(hasItem(DEFAULT_ENTITY_TYPE.toString())))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID)))
            .andExpect(jsonPath("$.[*].docType").value(hasItem(DEFAULT_DOC_TYPE.toString())))
            .andExpect(jsonPath("$.[*].filename").value(hasItem(DEFAULT_FILENAME)))
            .andExpect(jsonPath("$.[*].storageUrl").value(hasItem(DEFAULT_STORAGE_URL)))
            .andExpect(jsonPath("$.[*].mimeType").value(hasItem(DEFAULT_MIME_TYPE)))
            .andExpect(jsonPath("$.[*].sizeBytes").value(hasItem(DEFAULT_SIZE_BYTES.intValue())))
            .andExpect(jsonPath("$.[*].uploadedByLogin").value(hasItem(DEFAULT_UPLOADED_BY_LOGIN)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(sameInstant(DEFAULT_CREATED_AT))))
            .andExpect(jsonPath("$.[*].updatedAt").value(hasItem(sameInstant(DEFAULT_UPDATED_AT))));

        // Check, that the count call also returns 1
        restDocumentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultDocumentShouldNotBeFound(String filter) throws Exception {
        restDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restDocumentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingDocument() throws Exception {
        // Get the document
        restDocumentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDocument() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        int databaseSizeBeforeUpdate = documentRepository.findAll().size();

        // Update the document
        Document updatedDocument = documentRepository.findById(document.getId()).get();
        // Disconnect from session so that the updates on updatedDocument are not directly saved in db
        em.detach(updatedDocument);
        updatedDocument
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .entityId(UPDATED_ENTITY_ID)
            .docType(UPDATED_DOC_TYPE)
            .filename(UPDATED_FILENAME)
            .storageUrl(UPDATED_STORAGE_URL)
            .mimeType(UPDATED_MIME_TYPE)
            .sizeBytes(UPDATED_SIZE_BYTES)
            .uploadedByLogin(UPDATED_UPLOADED_BY_LOGIN)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        DocumentDTO documentDTO = documentMapper.toDto(updatedDocument);

        restDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, documentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(documentDTO))
            )
            .andExpect(status().isOk());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
        Document testDocument = documentList.get(documentList.size() - 1);
        assertThat(testDocument.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testDocument.getEntityType()).isEqualTo(UPDATED_ENTITY_TYPE);
        assertThat(testDocument.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
        assertThat(testDocument.getDocType()).isEqualTo(UPDATED_DOC_TYPE);
        assertThat(testDocument.getFilename()).isEqualTo(UPDATED_FILENAME);
        assertThat(testDocument.getStorageUrl()).isEqualTo(UPDATED_STORAGE_URL);
        assertThat(testDocument.getMimeType()).isEqualTo(UPDATED_MIME_TYPE);
        assertThat(testDocument.getSizeBytes()).isEqualTo(UPDATED_SIZE_BYTES);
        assertThat(testDocument.getUploadedByLogin()).isEqualTo(UPDATED_UPLOADED_BY_LOGIN);
        assertThat(testDocument.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
        assertThat(testDocument.getUpdatedAt()).isEqualTo(UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void putNonExistingDocument() throws Exception {
        int databaseSizeBeforeUpdate = documentRepository.findAll().size();
        document.setId(count.incrementAndGet());

        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, documentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(documentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDocument() throws Exception {
        int databaseSizeBeforeUpdate = documentRepository.findAll().size();
        document.setId(count.incrementAndGet());

        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(documentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDocument() throws Exception {
        int databaseSizeBeforeUpdate = documentRepository.findAll().size();
        document.setId(count.incrementAndGet());

        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDocumentMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(documentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDocumentWithPatch() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        int databaseSizeBeforeUpdate = documentRepository.findAll().size();

        // Update the document using partial update
        Document partialUpdatedDocument = new Document();
        partialUpdatedDocument.setId(document.getId());

        partialUpdatedDocument
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .sizeBytes(UPDATED_SIZE_BYTES)
            .createdAt(UPDATED_CREATED_AT);

        restDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDocument))
            )
            .andExpect(status().isOk());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
        Document testDocument = documentList.get(documentList.size() - 1);
        assertThat(testDocument.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testDocument.getEntityType()).isEqualTo(UPDATED_ENTITY_TYPE);
        assertThat(testDocument.getEntityId()).isEqualTo(DEFAULT_ENTITY_ID);
        assertThat(testDocument.getDocType()).isEqualTo(DEFAULT_DOC_TYPE);
        assertThat(testDocument.getFilename()).isEqualTo(DEFAULT_FILENAME);
        assertThat(testDocument.getStorageUrl()).isEqualTo(DEFAULT_STORAGE_URL);
        assertThat(testDocument.getMimeType()).isEqualTo(DEFAULT_MIME_TYPE);
        assertThat(testDocument.getSizeBytes()).isEqualTo(UPDATED_SIZE_BYTES);
        assertThat(testDocument.getUploadedByLogin()).isEqualTo(DEFAULT_UPLOADED_BY_LOGIN);
        assertThat(testDocument.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
        assertThat(testDocument.getUpdatedAt()).isEqualTo(DEFAULT_UPDATED_AT);
    }

    @Test
    @Transactional
    void fullUpdateDocumentWithPatch() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        int databaseSizeBeforeUpdate = documentRepository.findAll().size();

        // Update the document using partial update
        Document partialUpdatedDocument = new Document();
        partialUpdatedDocument.setId(document.getId());

        partialUpdatedDocument
            .tenantId(UPDATED_TENANT_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .entityId(UPDATED_ENTITY_ID)
            .docType(UPDATED_DOC_TYPE)
            .filename(UPDATED_FILENAME)
            .storageUrl(UPDATED_STORAGE_URL)
            .mimeType(UPDATED_MIME_TYPE)
            .sizeBytes(UPDATED_SIZE_BYTES)
            .uploadedByLogin(UPDATED_UPLOADED_BY_LOGIN)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);

        restDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDocument))
            )
            .andExpect(status().isOk());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
        Document testDocument = documentList.get(documentList.size() - 1);
        assertThat(testDocument.getTenantId()).isEqualTo(UPDATED_TENANT_ID);
        assertThat(testDocument.getEntityType()).isEqualTo(UPDATED_ENTITY_TYPE);
        assertThat(testDocument.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
        assertThat(testDocument.getDocType()).isEqualTo(UPDATED_DOC_TYPE);
        assertThat(testDocument.getFilename()).isEqualTo(UPDATED_FILENAME);
        assertThat(testDocument.getStorageUrl()).isEqualTo(UPDATED_STORAGE_URL);
        assertThat(testDocument.getMimeType()).isEqualTo(UPDATED_MIME_TYPE);
        assertThat(testDocument.getSizeBytes()).isEqualTo(UPDATED_SIZE_BYTES);
        assertThat(testDocument.getUploadedByLogin()).isEqualTo(UPDATED_UPLOADED_BY_LOGIN);
        assertThat(testDocument.getCreatedAt()).isEqualTo(UPDATED_CREATED_AT);
        assertThat(testDocument.getUpdatedAt()).isEqualTo(UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void patchNonExistingDocument() throws Exception {
        int databaseSizeBeforeUpdate = documentRepository.findAll().size();
        document.setId(count.incrementAndGet());

        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, documentDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(documentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDocument() throws Exception {
        int databaseSizeBeforeUpdate = documentRepository.findAll().size();
        document.setId(count.incrementAndGet());

        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(documentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDocument() throws Exception {
        int databaseSizeBeforeUpdate = documentRepository.findAll().size();
        document.setId(count.incrementAndGet());

        // Create the Document
        DocumentDTO documentDTO = documentMapper.toDto(document);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(documentDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Document in the database
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDocument() throws Exception {
        // Initialize the database
        documentRepository.saveAndFlush(document);

        int databaseSizeBeforeDelete = documentRepository.findAll().size();

        // Delete the document
        restDocumentMockMvc
            .perform(delete(ENTITY_API_URL_ID, document.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Document> documentList = documentRepository.findAll();
        assertThat(documentList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
