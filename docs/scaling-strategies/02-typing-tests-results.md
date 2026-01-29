# Scaling Strategy: Typing Tests & Results System
## Target: 20-30 Million Users

### Current Architecture
- **Test Storage**: MySQL `tests` table
- **Result Storage**: MySQL `test_results` table with JSON columns
- **Real-time**: WebSocket for live typing tests
- **Analytics**: Synchronous processing

---

## Scaling Challenges

### 1. **Test Result Storage**
- **Current**: Single table, JSON columns
- **At Scale**: 30M users × 10 tests/day = 300M results/day
- **Bottlenecks**: 
  - Database write throughput
  - JSON parsing overhead
  - Storage growth (100GB+/month)

### 2. **Real-time Test Execution**
- **Current**: Synchronous result processing
- **At Scale**: 100,000 concurrent tests
- **Bottlenecks**: 
  - WebSocket connections
  - Real-time calculation overhead
  - Result submission queue

### 3. **Test Content Delivery**
- **Current**: Direct database queries
- **At Scale**: Millions of test requests
- **Bottlenecks**: Database read capacity

---

## Scaling Solutions

### Phase 1: Database Optimization (0-5M users)

#### 1.1 Test Results Partitioning
```sql
-- Partition by date (monthly partitions)
CREATE TABLE test_results (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    test_id BIGINT,
    created_at DATETIME,
    -- other columns
) PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    -- ... monthly partitions
);
```

**Benefits:**
- Fast queries on recent data
- Easy archival of old data
- Parallel query execution

#### 1.2 Database Sharding
- **Shard Key**: `user_id` (hash-based)
- **Shards**: 4-8 shards
- **Replication**: 1 master + 2 replicas per shard

#### 1.3 Indexing Strategy
```sql
-- Critical indexes
CREATE INDEX idx_test_results_user_created ON test_results(user_id, created_at DESC);
CREATE INDEX idx_test_results_test_user ON test_results(test_id, user_id);
CREATE INDEX idx_test_results_type ON test_results(type);
CREATE INDEX idx_tests_category ON tests(category);
CREATE INDEX idx_tests_difficulty ON tests(difficulty);
```

#### 1.4 JSON Column Optimization
- **Current**: Full JSON stored in DB
- **Optimization**: Extract frequently queried fields
- **New Schema**:
```sql
ALTER TABLE test_results ADD COLUMN wpm INT;
ALTER TABLE test_results ADD COLUMN accuracy DECIMAL(5,2);
ALTER TABLE test_results ADD COLUMN errors INT;
-- Keep full JSON for detailed analysis
```

---

### Phase 2: Caching & CDN (5-10M users)

#### 2.1 Test Content Caching
- **Redis Cache**: Cache test content by test_id
- **TTL**: 24 hours (tests rarely change)
- **Cache Key**: `test:{testId}:content`
- **Cache Size**: 10GB for 100K tests

**Implementation:**
```java
@Cacheable(value = "testContent", key = "#testId")
public Test getTest(Long testId) {
    // Check Redis, fallback to DB
}
```

#### 2.2 Test Results Caching
- **Recent Results**: Cache last 10 results per user
- **TTL**: 1 hour
- **Cache Key**: `user:{userId}:recent_results`

#### 2.3 CDN for Static Test Content
- **Static Assets**: Test passages, instructions
- **CDN**: CloudFront/Cloudflare
- **Edge Locations**: 200+ locations worldwide

---

### Phase 3: Asynchronous Processing (10-20M users)

#### 3.1 Message Queue for Results
- **Queue**: Apache Kafka / RabbitMQ
- **Flow**:
```
User Completes Test → Send to Queue → Worker Processes → Store in DB → Update Analytics
```

**Benefits:**
- Handle peak loads (100K tests/minute)
- Decouple processing from user request
- Retry failed processing

#### 3.2 Result Processing Workers
- **Workers**: 50-100 worker instances
- **Processing**: 
  - Calculate WPM, accuracy
  - Generate analytics
  - Update leaderboards
  - Send notifications

**Worker Configuration:**
- **Auto-scaling**: Scale based on queue depth
- **Batch Processing**: Process 100 results at once
- **Dead Letter Queue**: Failed results for manual review

#### 3.3 Real-time WebSocket Scaling
- **WebSocket Server**: Dedicated cluster
- **Load Balancer**: Sticky sessions (session affinity)
- **Scaling**: 20-50 WebSocket servers
- **Connection Limit**: 10,000 connections/server

**Architecture:**
```
User → Load Balancer → WebSocket Server (sticky session)
     → Redis Pub/Sub (for cross-server communication)
```

---

### Phase 4: Data Archival & Analytics (20-30M users)

#### 4.1 Hot/Cold Storage
- **Hot Storage** (MySQL): Last 90 days
- **Cold Storage** (S3/OSS): Older than 90 days
- **Archival Process**: Daily batch job

**Query Strategy:**
- Recent results: Query MySQL
- Historical results: Query S3 (slower but cheaper)

#### 4.2 Time-Series Database
- **Database**: InfluxDB / TimescaleDB
- **Use Case**: 
  - User progress over time
  - Aggregate statistics
  - Trend analysis

**Data Model:**
```
measurement: typing_results
tags: user_id, test_type
fields: wpm, accuracy, errors
time: timestamp
```

#### 4.3 Data Warehouse
- **Warehouse**: Snowflake / BigQuery
- **ETL**: Daily batch from MySQL to warehouse
- **Use Cases**:
  - Business intelligence
  - User behavior analysis
  - A/B testing results

#### 4.4 Search & Analytics
- **Elasticsearch**: For test result search
- **Index**: User results, test performance
- **Real-time**: Index via Kafka

---

## Infrastructure Requirements

### Database
- **Test Results Shards**: 8 MySQL clusters
- **Per Shard**: 
  - 1 Primary (32 vCPU, 128GB RAM, 10TB SSD)
  - 2 Replicas (16 vCPU, 64GB RAM, 10TB SSD)
- **Test Content**: 2 MySQL clusters (read-heavy)

### Caching
- **Redis Cluster**: 6 nodes (3 masters + 3 replicas)
- **Per Node**: 64GB RAM, 16 vCPU
- **Total Memory**: 384GB

### Message Queue
- **Kafka Cluster**: 9 brokers
- **Per Broker**: 32 vCPU, 128GB RAM, 5TB SSD
- **Topics**: 
  - `test-results` (100 partitions)
  - `test-analytics` (50 partitions)

### Processing Workers
- **Workers**: 100 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

### WebSocket Servers
- **Servers**: 30 instances
- **Per Instance**: 8 vCPU, 16GB RAM
- **Connection Capacity**: 300,000 concurrent

### Storage
- **Hot Storage**: 80TB (MySQL)
- **Cold Storage**: 500TB (S3/OSS)
- **CDN**: 10TB cache

---

## Performance Targets

### Response Times
- **Test Load**: <100ms (p95)
- **Result Submission**: <200ms (p95)
- **Result Retrieval**: <150ms (p95)
- **Historical Results**: <2s (p95)

### Throughput
- **Test Requests**: 50,000/sec
- **Result Submissions**: 10,000/sec
- **Concurrent Tests**: 100,000
- **Results Processed**: 100,000/minute

### Availability
- **Uptime**: 99.99%
- **Data Durability**: 99.999999% (11 9's)

---

## Cost Estimation (Monthly)

### Database
- 8 shards × $3,000 = **$24,000**
- Test content DB: **$2,000**

### Caching
- Redis cluster: **$5,000**

### Message Queue
- Kafka cluster: **$12,000**

### Processing Workers
- 100 instances × $80 = **$8,000**

### WebSocket Servers
- 30 instances × $150 = **$4,500**

### Storage
- Hot storage: **$3,000**
- Cold storage: **$1,000**
- CDN: **$2,000**

### **Total**: ~$59,500/month

---

## Migration Plan

### Week 1-2: Database Partitioning
1. Create partitioned table structure
2. Migrate existing data
3. Update application queries

### Week 3-4: Caching Layer
1. Deploy Redis cluster
2. Implement test content caching
3. Cache recent results

### Week 5-8: Asynchronous Processing
1. Set up Kafka cluster
2. Implement message queue
3. Deploy processing workers
4. Migrate to async processing

### Week 9-12: Archival & Analytics
1. Set up time-series database
2. Implement archival process
3. Deploy data warehouse
4. Set up analytics dashboards

---

## Monitoring & Alerts

### Key Metrics
- **Result Submission Rate**: Monitor queue depth
- **Processing Latency**: p95 <5 seconds
- **Database Write Latency**: p95 <50ms
- **Cache Hit Rate**: >95%
- **WebSocket Connections**: Monitor per server

### Alerting
- **Critical**: Queue depth >100K, Processing latency >10s
- **Warning**: Cache hit rate <90%, DB latency >100ms

---

## Data Retention Policy

- **Hot Storage**: 90 days
- **Cold Storage**: 2 years
- **Analytics**: Indefinite (aggregated data)
- **User Deletion**: Remove from all storage systems

---

## Success Metrics

- ✅ Store 300M results/day
- ✅ Process results in <5 seconds
- ✅ Support 100K concurrent tests
- ✅ 99.99% uptime
- ✅ Query recent results in <150ms

