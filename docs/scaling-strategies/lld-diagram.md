# Low-Level Design (LLD) Diagram
## Typogram Platform - Detailed Component Design

---

## Database Schema Design

### Core Tables

```
┌─────────────────────────────────────────────────────────────┐
│                    users Table                              │
├─────────────────────────────────────────────────────────────┤
│  id (BIGINT, PK)                                           │
│  username (VARCHAR(20), UNIQUE)                            │
│  email (VARCHAR(50), UNIQUE)                               │
│  password (VARCHAR(120))                                    │
│  referral_code (VARCHAR(20), UNIQUE)                       │
│  token_version (BIGINT)                                    │
│  created_at (DATETIME)                                     │
│  updated_at (DATETIME)                                     │
│                                                             │
│  Indexes:                                                   │
│  • idx_users_email (email)                                 │
│  • idx_users_username (username)                           │
│  • idx_users_referral_code (referral_code)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                test_results Table                           │
│              (Partitioned by created_at)                    │
├─────────────────────────────────────────────────────────────┤
│  id (BIGINT, PK)                                           │
│  user_id (BIGINT, FK → users.id)                           │
│  test_id (BIGINT, FK → tests.id)                           │
│  type (VARCHAR(50))                                        │
│  result_details (JSON)                                      │
│  test_details (JSON)                                        │
│  reattempt_count (INT)                                      │
│  created_at (DATETIME)                                     │
│  updated_at (DATETIME)                                     │
│                                                             │
│  Partitions:                                                │
│  • p202401 (Jan 2024)                                      │
│  • p202402 (Feb 2024)                                      │
│  • ... (Monthly partitions)                                │
│                                                             │
│  Indexes:                                                   │
│  • idx_test_results_user_created (user_id, created_at)   │
│  • idx_test_results_test_user (test_id, user_id)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            user_typing_courses Table                         │
│           (Partitioned by user_id hash)                     │
├─────────────────────────────────────────────────────────────┤
│  id (BIGINT, PK)                                           │
│  user_id (BIGINT, FK → users.id)                           │
│  typing_course_id (BIGINT, FK → typing_courses.id)       │
│  enrolled_at (DATETIME)                                    │
│  expires_at (DATETIME)                                     │
│  created_at (DATETIME)                                     │
│                                                             │
│  Unique Constraint:                                         │
│  • uk_user_typing_course (user_id, typing_course_id)      │
│                                                             │
│  Partitions:                                                │
│  • partition_0 (user_id % 4 = 0)                           │
│  • partition_1 (user_id % 4 = 1)                           │
│  • partition_2 (user_id % 4 = 2)                           │
│  • partition_3 (user_id % 4 = 3)                           │
│                                                             │
│  Indexes:                                                   │
│  • idx_user_courses_user (user_id, enrolled_at)            │
│  • idx_user_courses_expires (expires_at)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## API Design

### REST API Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    API Endpoints                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication APIs:                                       │
│  POST   /api/auth/signup                                    │
│  POST   /api/auth/signin                                    │
│  POST   /api/auth/refresh                                   │
│  POST   /api/auth/logout                                    │
│                                                             │
│  User APIs:                                                 │
│  GET    /api/user/profile                                   │
│  PUT    /api/user/profile                                   │
│  GET    /api/user/{id}                                       │
│                                                             │
│  Test APIs:                                                 │
│  GET    /api/tests                                          │
│  GET    /api/tests/{id}                                     │
│  POST   /api/tests/{id}/submit                              │
│  GET    /api/test-results                                   │
│  GET    /api/test-results/{id}                              │
│                                                             │
│  Course APIs:                                               │
│  GET    /api/courses                                        │
│  GET    /api/courses/{id}                                   │
│  POST   /api/courses/{id}/subscribe                        │
│  GET    /api/user/courses                                   │
│                                                             │
│  Analytics APIs:                                            │
│  POST   /api/analytics/analyze                              │
│  GET    /api/analytics/my-insights                          │
│  GET    /api/analytics/practice-text                         │
│                                                             │
│  Leaderboard APIs:                                          │
│  GET    /api/leaderboard/global                             │
│  GET    /api/leaderboard/category/{category}                │
│  GET    /api/leaderboard/user/{userId}                      │
│                                                             │
│  Tournament APIs:                                          │
│  GET    /api/tournaments                                    │
│  POST   /api/tournaments/{id}/join                          │
│  GET    /api/tournaments/{id}/rankings                      │
│                                                             │
│  Payment APIs:                                              │
│  POST   /api/payments/create                                │
│  POST   /api/payments/verify                                │
│  GET    /api/coupons/validate?code={code}                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### API Request/Response Format

```
Request:
POST /api/tests/{id}/submit
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
Body:
{
  "typedText": "the quick brown fox...",
  "timeTaken": 120,
  "keystrokeData": {
    "keyTimings": [...],
    "keyErrors": {...}
  }
}

Response:
{
  "success": true,
  "data": {
    "testResultId": 12345,
    "wpm": 85.5,
    "accuracy": 98.2,
    "errors": 5
  },
  "message": "Test submitted successfully"
}
```

---

## Service Internal Design

### Authentication Service

```
┌─────────────────────────────────────────────────────────────┐
│              AuthService Class                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  + signup(SignupRequest): JwtResponse                      │
│    ├─> validateRequest()                                    │
│    ├─> checkDuplicate() → UserRepository                   │
│    ├─> hashPassword() → BCrypt                             │
│    ├─> createUser() → UserRepository                       │
│    ├─> generateToken() → JwtUtils                           │
│    └─> return JwtResponse                                   │
│                                                             │
│  + signin(LoginRequest): JwtResponse                       │
│    ├─> authenticate() → AuthenticationManager              │
│    ├─> getUser() → UserRepository                          │
│    ├─> incrementTokenVersion() → UserRepository            │
│    ├─> generateToken() → JwtUtils                          │
│    └─> return JwtResponse                                   │
│                                                             │
│  + validateToken(String): UserDetails                       │
│    ├─> parseToken() → JwtUtils                             │
│    ├─> checkTokenVersion() → UserRepository                 │
│    └─> return UserDetails                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Test Service

```
┌─────────────────────────────────────────────────────────────┐
│              TestService Class                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  + getTest(Long testId): TestDTO                           │
│    ├─> checkCache() → Redis                                 │
│    │   └─> if found: return cached                         │
│    ├─> getTest() → TestRepository                           │
│    ├─> cacheResult() → Redis                                │
│    └─> return TestDTO                                       │
│                                                             │
│  + submitTest(TestSubmission): TestResult                  │
│    ├─> validateSubmission()                                │
│    ├─> calculateResults() → TestCalculator                 │
│    ├─> saveResult() → TestResultRepository                 │
│    ├─> sendToQueue() → KafkaProducer                       │
│    │   └─> Topic: "test-results"                           │
│    │   └─> Message: {userId, testId, results}             │
│    └─> return TestResult                                    │
│                                                             │
│  + getTestResults(Long userId): List<TestResult>           │
│    ├─> checkCache() → Redis                                 │
│    ├─> getResults() → TestResultRepository                  │
│    ├─> cacheResults() → Redis                               │
│    └─> return List<TestResult>                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Analytics Service

```
┌─────────────────────────────────────────────────────────────┐
│          TypingAnalyticsService Class                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  + analyzeKeystrokeData(KeystrokeData): AnalyticsResult   │
│    ├─> calculatePerKeyStats()                               │
│    ├─> identifyWeakKeys()                                  │
│    ├─> calculateHealthScore()                              │
│    ├─> generateRecommendations()                            │
│    ├─> saveAnalytics() → AnalyticsRepository                │
│    └─> return AnalyticsResult                              │
│                                                             │
│  + getUserInsights(Long userId): UserInsights              │
│    ├─> checkCache() → Redis                                 │
│    ├─> getAnalytics() → AnalyticsRepository                │
│    ├─> aggregateData()                                      │
│    ├─> cacheResult() → Redis                                │
│    └─> return UserInsights                                  │
│                                                             │
│  + generatePracticeText(Long userId): String               │
│    ├─> getWeakKeys() → AnalyticsRepository                 │
│    ├─> generateText() → AITextGenerationService            │
│    ├─> cacheText() → Redis                                 │
│    └─> return String                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Message Queue Design

### Kafka Topics Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Kafka Topics                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Topic: test-results                                        │
│  Partitions: 10                                             │
│  Replication: 3                                             │
│  Message Format:                                            │
│  {                                                          │
│    "userId": 12345,                                         │
│    "testResultId": 67890,                                   │
│    "wpm": 85.5,                                             │
│    "accuracy": 98.2,                                        │
│    "timestamp": "2024-01-01T12:00:00Z"                     │
│  }                                                          │
│                                                             │
│  Topic: keystroke-analytics                                 │
│  Partitions: 20                                             │
│  Replication: 3                                             │
│  Message Format:                                            │
│  {                                                          │
│    "userId": 12345,                                         │
│    "testResultId": 67890,                                   │
│    "keyTimings": [...],                                     │
│    "keyErrors": {...},                                      │
│    "timestamp": "2024-01-01T12:00:00Z"                     │
│  }                                                          │
│                                                             │
│  Topic: leaderboard-updates                                 │
│  Partitions: 10                                             │
│  Replication: 3                                             │
│  Message Format:                                            │
│  {                                                          │
│    "userId": 12345,                                         │
│    "category": "global",                                    │
│    "wpm": 85.5,                                             │
│    "timestamp": "2024-01-01T12:00:00Z"                     │
│  }                                                          │
│                                                             │
│  Topic: email-send                                          │
│  Partitions: 20                                             │
│  Replication: 3                                             │
│  Message Format:                                            │
│  {                                                          │
│    "userId": 12345,                                         │
│    "emailType": "welcome",                                  │
│    "recipient": "user@example.com",                        │
│    "templateData": {...}                                    │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Consumer Group Design

```
┌─────────────────────────────────────────────────────────────┐
│              Consumer Groups                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Consumer Group: test-results-processors                   │
│  Topic: test-results                                        │
│  Instances: 10                                              │
│  Processing:                                                │
│    ├─> Calculate analytics                                 │
│    ├─> Update leaderboard                                  │
│    └─> Send notifications                                  │
│                                                             │
│  Consumer Group: analytics-processors                      │
│  Topic: keystroke-analytics                                 │
│  Instances: 20                                              │
│  Processing:                                                │
│    ├─> Analyze keystroke patterns                          │
│    ├─> Generate insights                                   │
│    └─> Update user analytics                               │
│                                                             │
│  Consumer Group: leaderboard-updaters                      │
│  Topic: leaderboard-updates                                 │
│  Instances: 5                                               │
│  Processing:                                                │
│    ├─> Update Redis sorted sets                            │
│    ├─> Calculate rankings                                  │
│    └─> Invalidate cache                                    │
│                                                             │
│  Consumer Group: email-senders                              │
│  Topic: email-send                                          │
│  Instances: 20                                              │
│  Processing:                                                │
│    ├─> Render email template                               │
│    ├─> Send via email service                              │
│    └─> Update email history                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Caching Strategy

### Redis Key Structure

```
┌─────────────────────────────────────────────────────────────┐
│              Redis Key Patterns                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Data:                                                 │
│  • user:{userId}:profile → UserDTO (TTL: 1 hour)          │
│  • user:{userId}:subscriptions → List<Course> (TTL: 15min)│
│  • user:{userId}:achievements → List<Achievement> (TTL: 1h)│
│                                                             │
│  Test Data:                                                 │
│  • test:{testId}:content → TestDTO (TTL: 24 hours)        │
│  • user:{userId}:recent_results → List<TestResult> (TTL: 1h)│
│                                                             │
│  Course Data:                                               │
│  • courses:active → List<CourseDTO> (TTL: 1 hour)        │
│  • course:{courseId}:details → CourseDTO (TTL: 1 hour)    │
│                                                             │
│  Leaderboard Data:                                          │
│  • leaderboard:{category}:{timeframe} → Sorted Set        │
│    (e.g., leaderboard:global:daily)                        │
│    Score: WPM, Member: userId                              │
│                                                             │
│  Tournament Data:                                           │
│  • tournament:{id}:state → Hash (TTL: until tournament ends)│
│  • tournament:{id}:rankings → Sorted Set                  │
│  • tournament:{id}:participants → Set                      │
│                                                             │
│  Session Data:                                              │
│  • session:{sessionId} → SessionData (TTL: 7 days)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Flow

```
┌─────────────────────────────────────────────────────────────┐
│          Cache Invalidation Strategy                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Event: User Profile Updated                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Update MySQL                                     │  │
│  │  2. Invalidate Redis: user:{userId}:profile         │  │
│  │  3. Publish event to Kafka: user-updated            │  │
│  │  4. Other services invalidate their caches          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Event: Course Subscribed                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Update MySQL                                     │  │
│  │  2. Invalidate Redis: user:{userId}:subscriptions   │  │
│  │  3. Update cache: courses:active (if needed)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Event: Test Result Submitted                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Save to MySQL                                    │  │
│  │  2. Invalidate Redis: user:{userId}:recent_results  │  │
│  │  3. Send to Kafka for async processing              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## WebSocket Design

### WebSocket Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          WebSocket Server (Socket.io)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Connection Management:                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Max connections per server: 5,000                 │  │
│  │  • Heartbeat interval: 30 seconds                   │  │
│  │  • Connection timeout: 60 seconds                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Room Management:                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  socket.join(roomId)                                 │  │
│  │  socket.leave(roomId)                                 │  │
│  │  io.to(roomId).emit(event, data)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Events:                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • connect: User connected                           │  │
│  │  • disconnect: User disconnected                     │  │
│  │  • join-tournament: Join tournament room             │  │
│  │  • progress-update: Send typing progress             │  │
│  │  • tournament-update: Broadcast tournament state    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Redis Pub/Sub Integration:                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Subscribe to: tournament:{id}:updates             │  │
│  │  • Publish to: tournament:{id}:updates              │  │
│  │  • Cross-server communication                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### WebSocket Message Format

```
┌─────────────────────────────────────────────────────────────┐
│              WebSocket Message Structure                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress Update:                                           │
│  {                                                          │
│    "type": "progress-update",                               │
│    "roomId": "tournament-123",                              │
│    "userId": 12345,                                         │
│    "data": {                                                │
│      "wpm": 85.5,                                           │
│      "accuracy": 98.2,                                      │
│      "position": 5,                                         │
│      "progress": 75                                         │
│    }                                                        │
│  }                                                          │
│                                                             │
│  Tournament Update:                                         │
│  {                                                          │
│    "type": "tournament-update",                             │
│    "roomId": "tournament-123",                              │
│    "data": {                                                │
│      "status": "started",                                   │
│      "participants": 50,                                    │
│      "timeRemaining": 300                                   │
│    }                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Connection Pool Design

```
┌─────────────────────────────────────────────────────────────┐
│          HikariCP Configuration                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Primary Database (Write):                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  maximumPoolSize: 100                               │  │
│  │  minimumIdle: 20                                    │  │
│  │  connectionTimeout: 30000 (30s)                     │  │
│  │  idleTimeout: 600000 (10min)                        │  │
│  │  maxLifetime: 1800000 (30min)                       │  │
│  │  leakDetectionThreshold: 60000 (60s)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Read Replica (Read):                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  maximumPoolSize: 50                                │  │
│  │  minimumIdle: 10                                     │  │
│  │  connectionTimeout: 30000 (30s)                      │  │
│  │  idleTimeout: 600000 (10min)                         │  │
│  │  maxLifetime: 1800000 (30min)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Connection Routing:                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @Transactional(readOnly = true) → Read Replica        │  │
│  │  @Transactional → Primary Database                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Design

```
┌─────────────────────────────────────────────────────────────┐
│          Error Handling Strategy                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Global Exception Handler:                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @ControllerAdvice                                  │  │
│  │  + handleException(Exception): ResponseEntity       │  │
│  │    ├─> logError()                                   │  │
│  │    ├─> formatErrorResponse()                        │  │
│  │    └─> return ResponseEntity                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Error Response Format:                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  {                                                   │  │
│  │    "success": false,                                 │  │
│  │    "error": {                                        │  │
│  │      "code": "ERROR_CODE",                           │  │
│  │      "message": "Error message",                     │  │
│  │      "timestamp": "2024-01-01T12:00:00Z"            │  │
│  │    }                                                 │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Retry Strategy (Kafka Consumers):                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Max retries: 3                                   │  │
│  │  • Backoff: Exponential (1s, 2s, 4s)               │  │
│  │  • Dead Letter Queue: Failed messages              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Design

```
┌─────────────────────────────────────────────────────────────┐
│          Security Implementation                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  JWT Token Structure:                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Header: {alg: "HS256", typ: "JWT"}                 │  │
│  │  Payload: {                                          │  │
│  │    userId: 12345,                                    │  │
│  │    username: "user123",                              │  │
│  │    roles: ["ROLE_USER"],                             │  │
│  │    tokenVersion: 1,                                  │  │
│  │    exp: 1234567890                                   │  │
│  │  }                                                   │  │
│  │  Signature: HMACSHA256(base64(header.payload), secret)│
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Rate Limiting Implementation:                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Redis Key: rate_limit:user:{userId}                │  │
│  │  Algorithm: Token Bucket                             │  │
│  │  Limits:                                             │  │
│  │    • Per user: 100 requests/minute                  │  │
│  │    • Per IP: 1,000 requests/minute                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Input Validation:                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • @Valid annotation on DTOs                        │  │
│  │  • Custom validators for business rules             │  │
│  │  • SQL injection prevention (parameterized queries) │  │
│  │  • XSS prevention (input sanitization)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring Design

```
┌─────────────────────────────────────────────────────────────┐
│          Monitoring Metrics                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Application Metrics:                                       │
│  • http_requests_total (counter)                          │
│  • http_request_duration_seconds (histogram)               │
│  • active_connections (gauge)                              │
│  • error_rate (gauge)                                      │
│                                                             │
│  Database Metrics:                                          │
│  • db_connection_pool_active (gauge)                      │
│  • db_query_duration_seconds (histogram)                  │
│  • db_connections_idle (gauge)                            │
│                                                             │
│  Cache Metrics:                                            │
│  • cache_hits_total (counter)                             │
│  • cache_misses_total (counter)                           │
│  • cache_size_bytes (gauge)                                │
│                                                             │
│  Message Queue Metrics:                                     │
│  • kafka_messages_produced_total (counter)                │
│  • kafka_messages_consumed_total (counter)                │
│  • kafka_consumer_lag (gauge)                              │
│                                                             │
│  Business Metrics:                                          │
│  • users_registered_total (counter)                       │
│  • tests_completed_total (counter)                        │
│  • active_users (gauge)                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Configuration

```
┌─────────────────────────────────────────────────────────────┐
│          Kubernetes Deployment                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Deployment YAML Structure:                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  apiVersion: apps/v1                                  │  │
│  │  kind: Deployment                                     │  │
│  │  metadata:                                            │  │
│  │    name: auth-service                                 │  │
│  │  spec:                                                │  │
│  │    replicas: 3                                        │  │
│  │    selector:                                          │  │
│  │      matchLabels:                                     │  │
│  │        app: auth-service                              │  │
│  │    template:                                         │  │
│  │      spec:                                           │  │
│  │        containers:                                    │  │
│  │        - name: auth-service                          │  │
│  │          image: typogram/auth-service:latest         │  │
│  │          resources:                                   │  │
│  │            requests:                                 │  │
│  │              cpu: 500m                               │  │
│  │              memory: 1Gi                             │  │
│  │            limits:                                   │  │
│  │              cpu: 2000m                              │  │
│  │              memory: 4Gi                             │  │
│  │          env:                                        │  │
│  │          - name: DB_HOST                             │  │
│  │            value: mysql-primary                      │  │
│  │          - name: REDIS_HOST                          │  │
│  │            value: redis-master                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Horizontal Pod Autoscaler:                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  minReplicas: 3                                     │  │
│  │  maxReplicas: 20                                    │  │
│  │  targetCPUUtilization: 70                           │  │
│  │  targetMemoryUtilization: 80                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Patterns

1. **Repository Pattern**: Data access abstraction
2. **Service Layer Pattern**: Business logic separation
3. **DTO Pattern**: Data transfer objects
4. **Factory Pattern**: Object creation
5. **Observer Pattern**: Event-driven architecture
6. **Strategy Pattern**: Algorithm selection
7. **Circuit Breaker**: Fault tolerance
8. **Retry Pattern**: Resilience

