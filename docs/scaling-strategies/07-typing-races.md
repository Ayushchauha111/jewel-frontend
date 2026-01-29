# Scaling Strategy: Typing Races System
## Target: 20-30 Million Users

### Current Architecture
- **Storage**: MySQL `typing_races` and `race_participants` tables
- **Real-time**: WebSocket for live races
- **Scoring**: Real-time calculation
- **Matching**: Direct database queries

---

## Scaling Challenges

### 1. **Race Matching**
- **Current**: Database queries for available races
- **At Scale**: 10K+ concurrent race requests
- **Bottlenecks**: 
  - Database query load
  - Matching algorithm overhead
  - Race creation/joining

### 2. **Real-time Race Updates**
- **Current**: WebSocket connections
- **At Scale**: 50K+ concurrent WebSocket connections
- **Bottlenecks**: 
  - Connection management
  - Progress broadcasting
  - State synchronization

### 3. **Race State Management**
- **Current**: Database storage
- **At Scale**: Thousands of active races
- **Bottlenecks**: 
  - State updates
  - Race completion processing
  - Result storage

---

## Scaling Solutions

### Phase 1: Redis State Management (0-5M users)

#### 1.1 Race State in Redis
- **Data Structure**: Redis Hash + Sorted Sets
- **Race State**: `race:{id}:state`
- **Participants**: `race:{id}:participants` (Hash)
- **Progress**: `race:{id}:progress` (Sorted Set by position)

**Benefits:**
- Fast updates
- Atomic operations
- Real-time rankings

#### 1.2 Race Matching Queue
- **Queue**: Redis List
- **Key**: `race:matchmaking:{difficulty}`
- **Algorithm**: FIFO matching
- **Timeout**: 30 seconds for matching

**Implementation:**
```java
// Add to queue
redis.lpush("race:matchmaking:medium", userId);

// Try to match (pop 2 users)
List<String> users = redis.brpop("race:matchmaking:medium", 30);
if (users.size() == 2) {
    createRace(users);
}
```

---

### Phase 2: WebSocket Infrastructure (5-10M users)

#### 2.1 WebSocket Cluster
- **Servers**: 20-50 WebSocket servers
- **Load Balancing**: Sticky sessions
- **Connection Limit**: 5,000 connections/server
- **Total Capacity**: 100,000-250,000 concurrent

#### 2.2 Message Broadcasting
- **Redis Pub/Sub**: For cross-server messaging
- **Channels**: `race:{id}:updates`
- **Message Types**:
  - Progress updates
  - Participant joined/left
  - Race started/ended

#### 2.3 Race State Synchronization
- **Storage**: Redis for active races
- **Persistence**: MySQL for completed races
- **Sync**: Background job every 5 seconds

---

### Phase 3: Asynchronous Processing (10-20M users)

#### 3.1 Message Queue for Race Events
- **Queue**: Apache Kafka
- **Topic**: `race-events` (50 partitions)
- **Flow**:
```
Race Event → Send to Kafka → Race Worker → Update Redis → Broadcast Update
```

**Event Types:**
- Race created
- Participant joined
- Progress update
- Race completed

#### 3.2 Race Processing Workers
- **Workers**: 50-100 instances
- **Processing**:
  - Match participants
  - Update race state
  - Calculate positions
  - Handle race completion
  - Store results

**Worker Configuration:**
- **Auto-scaling**: Based on active races
- **Batch Processing**: Process 100 events at once
- **Priority**: Time-sensitive events first

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Smart Matching
- **Algorithm**: Match by skill level, region, language
- **Storage**: User skill profiles in Redis
- **Matching Time**: <5 seconds

#### 4.2 Race Types
- **Quick Race**: 1-minute races
- **Standard Race**: 5-minute races
- **Marathon Race**: 15-minute races
- **Custom Race**: User-defined parameters

#### 4.3 Race Analytics
- **Time-Series DB**: InfluxDB for race metrics
- **Metrics**:
  - Average race duration
  - Participation rates
  - Win rates
  - Popular race types

---

## Infrastructure Requirements

### Caching
- **Redis Cluster**: 6 nodes (3 masters + 3 replicas)
- **Per Node**: 64GB RAM, 16 vCPU
- **Total Memory**: 384GB

### Message Queue
- **Kafka Cluster**: 6 brokers
- **Per Broker**: 16 vCPU, 64GB RAM, 2TB SSD
- **Topic**: `race-events` (50 partitions)

### Processing Workers
- **Workers**: 100 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

### WebSocket Servers
- **Servers**: 50 instances
- **Per Instance**: 8 vCPU, 16GB RAM
- **Connection Capacity**: 250,000 concurrent

### Database
- **MySQL Cluster**: 2 nodes (for completed races)
- **Per Node**: 8 vCPU, 32GB RAM, 1TB SSD

---

## Performance Targets

### Response Times
- **Race Matching**: <5 seconds (p95)
- **Race Join**: <200ms (p95)
- **Progress Update**: <100ms (p95)
- **WebSocket Latency**: <50ms (p95)

### Throughput
- **Race Requests**: 10,000/sec
- **Concurrent Races**: 5,000
- **Concurrent Participants**: 50,000
- **Progress Updates**: 50,000/sec

### Availability
- **Uptime**: 99.99%
- **Real-time Updates**: <100ms delay

---

## Cost Estimation (Monthly)

### Caching
- Redis cluster: **$5,000**

### Message Queue
- Kafka cluster: **$6,000**

### Processing Workers
- 100 instances × $80 = **$8,000**

### WebSocket Servers
- 50 instances × $150 = **$7,500**

### Database
- MySQL cluster: **$1,000**

### **Total**: ~$27,500/month

---

## Migration Plan

### Week 1-2: Redis State Management
1. Migrate race state to Redis
2. Implement matching queue
3. Set up Pub/Sub

### Week 3-4: WebSocket Infrastructure
1. Deploy WebSocket cluster
2. Implement load balancing
3. Set up cross-server communication

### Week 5-8: Asynchronous Processing
1. Set up Kafka cluster
2. Implement message queue
3. Deploy race workers
4. Migrate to async processing

### Week 9-12: Advanced Features
1. Implement smart matching
2. Add race types
3. Set up analytics
4. Deploy monitoring

---

## Monitoring & Alerts

### Key Metrics
- **Race Matching Time**: <5 seconds
- **Progress Update Latency**: <100ms
- **WebSocket Connections**: Monitor per server
- **Queue Depth**: Monitor backlog
- **Active Races**: Monitor count

### Alerting
- **Critical**: Matching time >10s, Queue depth >10K, WebSocket failures >1%
- **Warning**: Progress update latency >200ms, Redis memory >80%

---

## Success Metrics

- ✅ Support 5K concurrent races
- ✅ Handle 50K concurrent participants
- ✅ Race matching <5 seconds
- ✅ 99.99% uptime
- ✅ Real-time updates <100ms

