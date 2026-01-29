# Scaling Strategy: Community Features System
## Target: 20-30 Million Users

### Current Architecture
- **Storage**: MySQL tables (study_rooms, study_buddies, friendships, etc.)
- **Real-time**: WebSocket for chat
- **Features**: Study rooms, study buddies, discussion groups

---

## Scaling Challenges

### 1. **Study Room Management**
- **Current**: Single table, direct queries
- **At Scale**: 10K+ active rooms, millions of participants
- **Bottlenecks**: 
  - Room creation/joining
  - Participant management
  - Real-time updates

### 2. **Chat & Messaging**
- **Current**: WebSocket connections
- **At Scale**: 100K+ concurrent chat connections
- **Bottlenecks**: 
  - Message broadcasting
  - Connection management
  - Message persistence

### 3. **Social Graph**
- **Current**: Friendships table
- **At Scale**: 30M users × 50 friends avg = 1.5B relationships
- **Bottlenecks**: 
  - Friend queries
  - Recommendation algorithms
  - Graph traversals

---

## Scaling Solutions

### Phase 1: Database Optimization (0-5M users)

#### 1.1 Study Room Sharding
- **Shard Key**: `room_id` (hash-based)
- **Shards**: 2-4 shards
- **Replication**: 1 master + 2 replicas per shard

#### 1.2 Social Graph Optimization
- **Storage**: Separate table for friendships
- **Indexing**: Bidirectional indexes
- **Partitioning**: By user_id hash

```sql
CREATE INDEX idx_friendships_user1 ON friendships(user1_id, user2_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id, user1_id);
```

#### 1.3 Chat Message Partitioning
```sql
-- Partition by room_id and date
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY,
    room_id BIGINT,
    user_id BIGINT,
    message TEXT,
    created_at DATETIME,
    -- other columns
) PARTITION BY HASH(room_id) PARTITIONS 8;
```

---

### Phase 2: Real-time Infrastructure (5-10M users)

#### 2.1 Redis for Room State
- **Data Structure**: Redis Hash + Sets
- **Room State**: `room:{id}:state`
- **Participants**: `room:{id}:participants` (Set)
- **Active Rooms**: `rooms:active` (Sorted Set)

#### 2.2 WebSocket Cluster
- **Servers**: 20-50 WebSocket servers
- **Load Balancing**: Sticky sessions
- **Connection Limit**: 5,000 connections/server
- **Total Capacity**: 100,000-250,000 concurrent

#### 2.3 Message Broadcasting
- **Redis Pub/Sub**: For cross-server messaging
- **Channels**: `room:{id}:messages`
- **Scaling**: Automatic with Redis cluster

---

### Phase 3: Message Queue & Workers (10-20M users)

#### 3.1 Message Queue for Chat
- **Queue**: Apache Kafka
- **Topic**: `chat-messages` (100 partitions)
- **Flow**:
```
User Sends Message → Send to Kafka → Message Worker → Store in DB → Broadcast to Room
```

#### 3.2 Chat Processing Workers
- **Workers**: 50-100 instances
- **Processing**:
  - Store messages
  - Update room state
  - Send notifications
  - Handle moderation

#### 3.3 Social Graph Service
- **Dedicated Service**: Handle friend operations
- **Storage**: Graph database (Neo4j) or optimized MySQL
- **Features**:
  - Friend recommendations
  - Mutual friends
  - Friend search

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Graph Database for Social
- **Database**: Neo4j
- **Use Cases**:
  - Friend recommendations
  - Community detection
  - Influence analysis
  - Path finding

#### 4.2 Real-time Presence
- **Redis**: Track user online status
- **Key**: `user:{userId}:presence`
- **TTL**: 5 minutes (heartbeat)
- **Features**: Online/offline status, typing indicators

#### 4.3 Community Analytics
- **Time-Series DB**: InfluxDB for community metrics
- **Metrics**:
  - Active rooms
  - Message volume
  - User engagement
  - Popular topics

---

## Infrastructure Requirements

### Database
- **Study Room Shards**: 2 MySQL clusters
- **Social Graph**: 1 MySQL cluster + Neo4j cluster
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
- **Topic**: `chat-messages` (100 partitions)

### Processing Workers
- **Workers**: 100 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

### WebSocket Servers
- **Servers**: 50 instances
- **Per Instance**: 8 vCPU, 16GB RAM
- **Connection Capacity**: 250,000 concurrent

### Graph Database
- **Neo4j Cluster**: 3 nodes
- **Per Node**: 16 vCPU, 64GB RAM, 2TB SSD

---

## Performance Targets

### Response Times
- **Room Join**: <200ms (p95)
- **Message Send**: <100ms (p95)
- **Message Delivery**: <200ms (p95)
- **Friend Query**: <150ms (p95)

### Throughput
- **Room Operations**: 10,000/sec
- **Message Sends**: 50,000/sec
- **Concurrent Rooms**: 10,000
- **Concurrent Users**: 100,000

### Availability
- **Uptime**: 99.99%
- **Message Delivery**: 99.9% success rate

---

## Cost Estimation (Monthly)

### Database
- 3 MySQL clusters × $2,000 = **$6,000**
- Neo4j cluster: **$3,000**

### Caching
- Redis cluster: **$5,000**

### Message Queue
- Kafka cluster: **$6,000**

### Processing Workers
- 100 instances × $80 = **$8,000**

### WebSocket Servers
- 50 instances × $150 = **$7,500**

### **Total**: ~$35,500/month

---

## Migration Plan

### Week 1-2: Database Optimization
1. Implement table partitioning
2. Add indexes
3. Set up read replicas

### Week 3-4: Redis State Management
1. Migrate room state to Redis
2. Implement presence tracking
3. Set up Pub/Sub

### Week 5-8: Message Queue
1. Set up Kafka cluster
2. Implement message queue
3. Deploy chat workers
4. Migrate to async processing

### Week 9-12: Graph Database
1. Set up Neo4j cluster
2. Migrate social graph
3. Implement recommendations
4. Deploy monitoring

---

## Monitoring & Alerts

### Key Metrics
- **Room Join Time**: <200ms
- **Message Send Latency**: <100ms
- **Message Delivery Rate**: >99.9%
- **WebSocket Connections**: Monitor per server
- **Queue Depth**: Monitor backlog

### Alerting
- **Critical**: Join time >1s, Message delivery <99%, Queue depth >10K
- **Warning**: Message latency >500ms, Redis memory >80%

---

## Success Metrics

- ✅ Support 10K concurrent rooms
- ✅ Handle 100K concurrent users
- ✅ Message delivery <200ms
- ✅ 99.99% uptime
- ✅ Friend queries <150ms

