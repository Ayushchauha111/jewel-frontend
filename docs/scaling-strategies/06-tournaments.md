# Scaling Strategy: Tournaments System
## Target: 20-30 Million Users

### Current Architecture
- **Storage**: MySQL `tournaments` and `tournament_participants` tables
- **Real-time**: WebSocket for live tournaments
- **Scoring**: Real-time calculation
- **Rankings**: Database queries

---

## Scaling Challenges

### 1. **Tournament Participation**
- **Current**: Single table, direct queries
- **At Scale**: 100K+ concurrent tournaments, millions of participants
- **Bottlenecks**: 
  - Database write load
  - Real-time scoring
  - Ranking calculations

### 2. **Real-time Updates**
- **Current**: WebSocket connections
- **At Scale**: 100K+ concurrent WebSocket connections
- **Bottlenecks**: 
  - Connection management
  - Message broadcasting
  - State synchronization

### 3. **Tournament Management**
- **Current**: Direct database operations
- **At Scale**: Thousands of active tournaments
- **Bottlenecks**: 
  - Tournament creation/updates
  - Participant management
  - Result processing

---

## Scaling Solutions

### Phase 1: Database Optimization (0-5M users)

#### 1.1 Tournament Table Sharding
- **Shard Key**: `tournament_id` (hash-based)
- **Shards**: 2-4 shards
- **Replication**: 1 master + 2 replicas per shard

#### 1.2 Participant Table Partitioning
```sql
-- Partition by tournament_id
CREATE TABLE tournament_participants (
    id BIGINT PRIMARY KEY,
    tournament_id BIGINT,
    user_id BIGINT,
    score DECIMAL(10,2),
    rank INT,
    -- other columns
) PARTITION BY HASH(tournament_id) PARTITIONS 8;
```

#### 1.3 Indexing Strategy
```sql
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id, score DESC);
CREATE INDEX idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX idx_tournaments_status ON tournaments(status, start_time);
CREATE INDEX idx_tournaments_active ON tournaments(is_active, end_time);
```

---

### Phase 2: Real-time Infrastructure (5-10M users)

#### 2.1 Redis for Tournament State
- **Data Structure**: Redis Hash + Sorted Sets
- **Tournament State**: `tournament:{id}:state`
- **Rankings**: `tournament:{id}:rankings` (Sorted Set)
- **Participants**: `tournament:{id}:participants` (Hash)

**Benefits:**
- Fast updates (O(1) for hash, O(log N) for sorted set)
- Atomic operations
- Real-time rankings

#### 2.2 WebSocket Cluster
- **Servers**: 20-50 WebSocket servers
- **Load Balancing**: Sticky sessions (session affinity)
- **Connection Limit**: 5,000 connections/server
- **Total Capacity**: 100,000-250,000 concurrent connections

**Architecture:**
```
User → Load Balancer → WebSocket Server → Redis Pub/Sub (cross-server communication)
```

#### 2.3 Message Broadcasting
- **Redis Pub/Sub**: For cross-server messaging
- **Channels**: `tournament:{id}:updates`
- **Scaling**: Automatic with Redis cluster

---

### Phase 3: Asynchronous Processing (10-20M users)

#### 3.1 Message Queue for Scoring
- **Queue**: Apache Kafka
- **Topic**: `tournament-scores` (50 partitions)
- **Flow**:
```
User Completes Test → Send Score to Kafka → Scoring Worker → Update Redis → Broadcast Update
```

#### 3.2 Scoring Workers
- **Workers**: 50-100 instances
- **Processing**:
  - Calculate scores
  - Update rankings
  - Check tournament end conditions
  - Send notifications

**Worker Configuration:**
- **Auto-scaling**: Based on active tournaments
- **Batch Processing**: Process 100 scores at once
- **Priority Queue**: Handle time-sensitive tournaments first

#### 3.3 Tournament Lifecycle Management
- **Scheduler**: Cron jobs for tournament start/end
- **State Machine**: Manage tournament states
- **Notifications**: Send start/end notifications

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Tournament Types
- **Scheduled**: Pre-defined start/end times
- **Instant**: Start immediately when full
- **Private**: Invite-only tournaments
- **Public**: Open to all users

#### 4.2 Tournament Analytics
- **Time-Series DB**: InfluxDB for tournament metrics
- **Metrics**:
  - Participation rates
  - Average scores
  - Tournament completion rates
  - Popular tournament types

#### 4.3 Prize Distribution
- **Automated**: Background job for prize calculation
- **Storage**: Separate table for prizes
- **Notifications**: Email/push notifications

---

## Infrastructure Requirements

### Database
- **Tournament Shards**: 2 MySQL clusters
- **Per Shard**: 
  - 1 Primary (16 vCPU, 64GB RAM, 2TB SSD)
  - 2 Replicas (8 vCPU, 32GB RAM, 2TB SSD)

### Caching
- **Redis Cluster**: 6 nodes (3 masters + 3 replicas)
- **Per Node**: 64GB RAM, 16 vCPU
- **Total Memory**: 384GB

### Message Queue
- **Kafka Cluster**: 6 brokers
- **Per Broker**: 16 vCPU, 64GB RAM, 2TB SSD
- **Topic**: `tournament-scores` (50 partitions)

### Processing Workers
- **Workers**: 100 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

### WebSocket Servers
- **Servers**: 50 instances
- **Per Instance**: 8 vCPU, 16GB RAM
- **Connection Capacity**: 250,000 concurrent

---

## Performance Targets

### Response Times
- **Tournament Load**: <200ms (p95)
- **Score Update**: <500ms (p95)
- **Ranking Update**: <1 second (async)
- **WebSocket Latency**: <50ms (p95)

### Throughput
- **Tournament Views**: 50,000/sec
- **Score Submissions**: 5,000/sec
- **Concurrent Tournaments**: 10,000
- **Concurrent Participants**: 100,000

### Availability
- **Uptime**: 99.99%
- **Real-time Updates**: <1 second delay

---

## Cost Estimation (Monthly)

### Database
- 2 shards × $2,000 = **$4,000**

### Caching
- Redis cluster: **$5,000**

### Message Queue
- Kafka cluster: **$6,000**

### Processing Workers
- 100 instances × $80 = **$8,000**

### WebSocket Servers
- 50 instances × $150 = **$7,500**

### **Total**: ~$30,500/month

---

## Migration Plan

### Week 1-2: Database Optimization
1. Implement table partitioning
2. Add indexes
3. Set up read replicas

### Week 3-4: Redis State Management
1. Migrate tournament state to Redis
2. Implement rankings with sorted sets
3. Set up Pub/Sub

### Week 5-8: Asynchronous Processing
1. Set up Kafka cluster
2. Implement message queue
3. Deploy scoring workers
4. Migrate to async processing

### Week 9-12: WebSocket Scaling
1. Deploy WebSocket cluster
2. Implement load balancing
3. Set up cross-server communication
4. Test real-time updates

---

## Monitoring & Alerts

### Key Metrics
- **Tournament Load Time**: <200ms
- **Score Update Latency**: <500ms
- **WebSocket Connections**: Monitor per server
- **Queue Depth**: Monitor backlog
- **Active Tournaments**: Monitor count

### Alerting
- **Critical**: Load time >1s, Queue depth >10K, WebSocket failures >1%
- **Warning**: Score update latency >1s, Redis memory >80%

---

## Success Metrics

- ✅ Support 10K concurrent tournaments
- ✅ Handle 100K concurrent participants
- ✅ Score updates <500ms
- ✅ 99.99% uptime
- ✅ Real-time updates <1 second

