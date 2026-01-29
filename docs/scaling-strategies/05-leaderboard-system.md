# Scaling Strategy: Leaderboard System
## Target: 20-30 Million Users

### Current Architecture
- **Storage**: MySQL table with rankings
- **Updates**: Real-time on test completion
- **Queries**: Direct database queries
- **Caching**: Basic Redis cache

---

## Scaling Challenges

### 1. **Ranking Calculations**
- **Current**: Real-time calculation
- **At Scale**: 300M test results/day = 300M ranking updates
- **Bottlenecks**: 
  - Expensive ranking queries
  - Database write load
  - Concurrent update conflicts

### 2. **Leaderboard Queries**
- **Current**: Direct database queries
- **At Scale**: Millions of leaderboard views
- **Bottlenecks**: 
  - Complex ranking queries
  - Database read capacity
  - Cache invalidation

### 3. **Multiple Leaderboards**
- **Current**: Single global leaderboard
- **At Scale**: Need category-based, time-based leaderboards
- **Bottlenecks**: Multiple ranking calculations

---

## Scaling Solutions

### Phase 1: Caching Strategy (0-5M users)

#### 1.1 Redis Sorted Sets
- **Data Structure**: Redis Sorted Sets (ZSET)
- **Key**: `leaderboard:{category}:{timeframe}`
- **Score**: WPM or accuracy
- **Member**: User ID

**Benefits:**
- O(log N) ranking operations
- Built-in range queries
- Atomic updates

**Implementation:**
```java
// Update score
redis.zadd("leaderboard:global:daily", wpm, userId);

// Get top 100
redis.zrevrange("leaderboard:global:daily", 0, 99);
```

#### 1.2 Leaderboard Caching
- **Cache**: Top 1000 positions
- **TTL**: 5 minutes
- **Update**: Background job every minute

#### 1.3 Multiple Leaderboards
- **Categories**: Global, Category-based, Exam-specific
- **Timeframes**: Daily, Weekly, Monthly, All-time
- **Storage**: Separate Redis keys per leaderboard

---

### Phase 2: Asynchronous Updates (5-10M users)

#### 2.1 Message Queue for Updates
- **Queue**: Apache Kafka
- **Topic**: `leaderboard-updates` (50 partitions)
- **Flow**:
```
Test Complete → Send to Kafka → Leaderboard Worker → Update Redis → Invalidate Cache
```

**Message Format:**
```json
{
  "userId": 12345,
  "testResultId": 67890,
  "wpm": 85.5,
  "accuracy": 98.2,
  "category": "ssc",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 2.2 Leaderboard Update Workers
- **Workers**: 20-50 instances
- **Processing**:
  - Update Redis sorted sets
  - Calculate rankings
  - Update cache
  - Handle tie-breaking

**Worker Configuration:**
- **Batch Processing**: Process 100 updates at once
- **Deduplication**: Handle duplicate updates
- **Error Handling**: Retry failed updates

#### 2.3 Ranking Calculation
- **Algorithm**: 
  - Primary: WPM
  - Secondary: Accuracy
  - Tertiary: Timestamp (newer is better)
- **Score Formula**: `wpm * 10000 + accuracy * 100 + timestamp_score`

---

### Phase 3: Distributed Leaderboards (10-20M users)

#### 3.1 Sharded Leaderboards
- **Sharding**: By user_id hash
- **Shards**: 4-8 Redis clusters
- **Aggregation**: Merge results from all shards

**Architecture:**
```
User Update → Hash(userId) → Route to Shard → Update Shard → Aggregate Results
```

#### 3.2 Leaderboard Snapshots
- **Storage**: MySQL for historical rankings
- **Frequency**: Daily snapshots
- **Use Cases**: 
  - Historical leaderboards
  - Analytics
  - Awards/recognition

#### 3.3 Real-time Updates
- **WebSocket**: Push updates to active users
- **Pub/Sub**: Redis Pub/Sub for notifications
- **Scaling**: 10-20 WebSocket servers

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Incremental Rankings
- **Algorithm**: Incremental update instead of full recalculation
- **Storage**: Maintain ranking deltas
- **Benefits**: Faster updates, lower CPU

#### 4.2 Personalized Leaderboards
- **Filters**: Friends, Region, Age group
- **Storage**: Separate Redis keys per filter
- **Calculation**: Background job (hourly)

#### 4.3 Leaderboard Analytics
- **Time-Series DB**: InfluxDB for ranking trends
- **Metrics**:
  - Ranking changes over time
  - User movement
  - Category popularity

---

## Infrastructure Requirements

### Caching
- **Redis Cluster**: 6 nodes (3 masters + 3 replicas)
- **Per Node**: 64GB RAM, 16 vCPU
- **Total Memory**: 384GB
- **Data Structures**: Sorted Sets (ZSET)

### Message Queue
- **Kafka Cluster**: 6 brokers
- **Per Broker**: 16 vCPU, 64GB RAM, 2TB SSD
- **Topic**: `leaderboard-updates` (50 partitions)

### Processing Workers
- **Workers**: 50 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

### Database
- **MySQL Cluster**: 2 nodes (for snapshots)
- **Per Node**: 8 vCPU, 32GB RAM, 1TB SSD

### WebSocket Servers
- **Servers**: 20 instances
- **Per Instance**: 4 vCPU, 8GB RAM

---

## Performance Targets

### Response Times
- **Leaderboard Load**: <100ms (p95)
- **Ranking Update**: <1 second (async)
- **User Rank Query**: <50ms (p95)

### Throughput
- **Leaderboard Views**: 100,000/sec
- **Ranking Updates**: 10,000/sec
- **Concurrent Users**: 50,000

### Availability
- **Uptime**: 99.99%
- **Data Consistency**: Eventual consistency (1 minute)

---

## Cost Estimation (Monthly)

### Caching
- Redis cluster: **$5,000**

### Message Queue
- Kafka cluster: **$6,000**

### Processing Workers
- 50 instances × $80 = **$4,000**

### Database
- MySQL cluster: **$1,000**

### WebSocket Servers
- 20 instances × $100 = **$2,000**

### **Total**: ~$18,000/month

---

## Migration Plan

### Week 1-2: Redis Sorted Sets
1. Migrate to Redis sorted sets
2. Implement leaderboard queries
3. Set up caching

### Week 3-4: Asynchronous Updates
1. Set up Kafka cluster
2. Implement message queue
3. Deploy update workers
4. Migrate to async updates

### Week 5-8: Distributed Leaderboards
1. Implement sharding
2. Set up aggregation
3. Deploy WebSocket servers
4. Test real-time updates

### Week 9-12: Advanced Features
1. Implement incremental rankings
2. Add personalized leaderboards
3. Set up analytics
4. Deploy monitoring

---

## Monitoring & Alerts

### Key Metrics
- **Leaderboard Load Time**: <100ms
- **Update Latency**: <1 second
- **Cache Hit Rate**: >99%
- **Queue Depth**: Monitor backlog
- **Redis Memory**: Monitor usage

### Alerting
- **Critical**: Load time >500ms, Queue depth >10K
- **Warning**: Cache hit rate <95%, Redis memory >80%

---

## Success Metrics

- ✅ Support 300M ranking updates/day
- ✅ Leaderboard load <100ms
- ✅ 99.99% uptime
- ✅ Real-time updates <1 second
- ✅ Support 100K leaderboard views/sec

