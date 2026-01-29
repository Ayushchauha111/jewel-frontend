# Scaling Strategy: Achievements System
## Target: 20-30 Million Users

### Current Architecture
- **Storage**: MySQL `achievements` and `user_achievements` tables
- **Unlocking**: Synchronous check on test completion
- **Display**: Direct database queries

---

## Scaling Challenges

### 1. **Achievement Unlocking**
- **Current**: Synchronous check on every test
- **At Scale**: 300M tests/day = 300M achievement checks
- **Bottlenecks**: 
  - Database queries
  - Unlock logic processing
  - Notification sending

### 2. **User Achievement Storage**
- **Current**: Single table
- **At Scale**: 30M users × 50 achievements avg = 1.5B records
- **Bottlenecks**: 
  - Database size
  - Query performance
  - Storage growth

### 3. **Achievement Display**
- **Current**: Direct database queries
- **At Scale**: Millions of profile views
- **Bottlenecks**: 
  - Database read capacity
  - Query performance

---

## Scaling Solutions

### Phase 1: Database Optimization (0-5M users)

#### 1.1 User Achievement Partitioning
```sql
-- Partition by user_id hash
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    achievement_id BIGINT,
    unlocked_at DATETIME,
    -- other columns
) PARTITION BY HASH(user_id) PARTITIONS 8;
```

#### 1.2 Indexing Strategy
```sql
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_achievements_category ON achievements(category);
```

---

### Phase 2: Caching Strategy (5-10M users)

#### 2.1 User Achievement Cache
- **Redis Cache**: Cache user's achievements
- **TTL**: 1 hour
- **Cache Key**: `user:{userId}:achievements`
- **Invalidation**: On achievement unlock

#### 2.2 Achievement Definition Cache
- **Cache**: All achievement definitions
- **TTL**: 24 hours (rarely change)
- **Cache Key**: `achievements:all`, `achievement:{id}`

#### 2.3 Achievement Progress Cache
- **Cache**: User's progress towards achievements
- **TTL**: 15 minutes
- **Cache Key**: `user:{userId}:achievement_progress`

---

### Phase 3: Asynchronous Processing (10-20M users)

#### 3.1 Message Queue for Unlocking
- **Queue**: Apache Kafka
- **Topic**: `achievement-events` (50 partitions)
- **Flow**:
```
Test Complete → Send Event to Kafka → Achievement Worker → Check Conditions → Unlock → Store → Notify
```

**Event Format:**
```json
{
  "userId": 12345,
  "testResultId": 67890,
  "eventType": "test_completed",
  "metrics": {
    "wpm": 85.5,
    "accuracy": 98.2,
    "testCount": 150
  }
}
```

#### 3.2 Achievement Processing Workers
- **Workers**: 50-100 instances
- **Processing**:
  - Check unlock conditions
  - Update progress
  - Unlock achievements
  - Send notifications
  - Update cache

**Worker Configuration:**
- **Auto-scaling**: Based on queue depth
- **Batch Processing**: Process 100 events at once
- **Deduplication**: Handle duplicate events

#### 3.3 Achievement Rules Engine
- **Storage**: Redis for rule definitions
- **Evaluation**: Fast rule evaluation
- **Caching**: Compiled rules in memory

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Real-time Progress Tracking
- **Redis**: Track progress in real-time
- **Key**: `user:{userId}:achievement:{id}:progress`
- **Update**: On every relevant event
- **Benefits**: Instant progress updates

#### 4.2 Achievement Analytics
- **Time-Series DB**: InfluxDB for achievement metrics
- **Metrics**:
  - Unlock rates
  - Popular achievements
  - Average time to unlock
  - User engagement

#### 4.3 Personalized Achievements
- **Algorithm**: Based on user behavior
- **Storage**: Pre-computed in Redis
- **Update**: Background job (daily)

---

## Infrastructure Requirements

### Database
- **MySQL Cluster**: 2 nodes
- **Per Node**: 
  - 1 Primary (16 vCPU, 64GB RAM, 2TB SSD)
  - 2 Replicas (8 vCPU, 32GB RAM, 2TB SSD)

### Caching
- **Redis Cluster**: 6 nodes (3 masters + 3 replicas)
- **Per Node**: 32GB RAM, 8 vCPU
- **Total Memory**: 192GB

### Message Queue
- **Kafka Cluster**: 6 brokers
- **Per Broker**: 16 vCPU, 64GB RAM, 2TB SSD
- **Topic**: `achievement-events` (50 partitions)

### Processing Workers
- **Workers**: 100 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

---

## Performance Targets

### Response Times
- **Achievement Display**: <100ms (p95)
- **Progress Update**: <200ms (async)
- **Unlock Processing**: <5 seconds (async)

### Throughput
- **Achievement Checks**: 10,000/sec
- **Unlock Events**: 1,000/sec
- **Display Requests**: 50,000/sec

### Availability
- **Uptime**: 99.99%
- **Unlock Success Rate**: >99.9%

---

## Cost Estimation (Monthly)

### Database
- MySQL cluster: **$2,000**

### Caching
- Redis cluster: **$3,000**

### Message Queue
- Kafka cluster: **$6,000**

### Processing Workers
- 100 instances × $80 = **$8,000**

### **Total**: ~$19,000/month

---

## Migration Plan

### Week 1-2: Database Optimization
1. Implement table partitioning
2. Add indexes
3. Set up read replicas

### Week 3-4: Caching
1. Deploy Redis cluster
2. Implement achievement caching
3. Cache user progress

### Week 5-8: Asynchronous Processing
1. Set up Kafka cluster
2. Implement message queue
3. Deploy achievement workers
4. Migrate to async processing

### Week 9-12: Advanced Features
1. Implement real-time progress
2. Set up analytics
3. Deploy monitoring
4. Optimize unlock logic

---

## Monitoring & Alerts

### Key Metrics
- **Achievement Display Time**: <100ms
- **Unlock Processing Latency**: <5 seconds
- **Queue Depth**: Monitor backlog
- **Unlock Success Rate**: >99.9%
- **Cache Hit Rate**: >95%

### Alerting
- **Critical**: Processing latency >10s, Queue depth >10K, Unlock failures >1%
- **Warning**: Display time >200ms, Cache hit rate <90%

---

## Success Metrics

- ✅ Process 300M achievement checks/day
- ✅ Achievement display <100ms
- ✅ Unlock processing <5 seconds
- ✅ 99.99% uptime
- ✅ Unlock success rate >99.9%

