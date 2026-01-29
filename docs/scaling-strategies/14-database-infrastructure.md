# Scaling Strategy: Database & Infrastructure
## Target: 20-30 Million Users

### Current Architecture
- **Database**: MySQL (single instance)
- **ORM**: JPA/Hibernate
- **Connection Pooling**: HikariCP
- **Replication**: None

---

## Scaling Challenges

### 1. **Database Capacity**
- **Current**: Single MySQL instance
- **At Scale**: 30M users, billions of records
- **Bottlenecks**: 
  - Storage capacity
  - Query performance
  - Connection limits

### 2. **Read/Write Load**
- **Current**: Single database for all operations
- **At Scale**: Millions of reads/writes per second
- **Bottlenecks**: 
  - Write contention
  - Read capacity
  - Lock contention

### 3. **Data Growth**
- **Current**: Unlimited growth
- **At Scale**: 100TB+ data
- **Bottlenecks**: 
  - Storage costs
  - Backup/restore time
  - Query performance

---

## Scaling Solutions

### Phase 1: Read Replicas (0-5M users)

#### 1.1 Master-Slave Replication
- **Master**: Write operations
- **Slaves**: Read operations (3 replicas)
- **Load Balancing**: Route reads to replicas
- **Failover**: Automatic promotion of slave to master

**Configuration:**
```sql
-- Master
server-id = 1
log-bin = mysql-bin
binlog-format = ROW

-- Slave
server-id = 2
relay-log = mysql-relay-bin
read-only = 1
```

#### 1.2 Connection Pooling
- **HikariCP Configuration**:
```properties
spring.datasource.hikari.maximum-pool-size=200
spring.datasource.hikari.minimum-idle=50
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.leak-detection-threshold=60000
```

---

### Phase 2: Database Sharding (5-10M users)

#### 2.1 Horizontal Sharding
- **Shard Key**: User ID (hash-based)
- **Shards**: 4-8 shards
- **Strategy**: Consistent hashing
- **Replication**: 1 master + 2 replicas per shard

**Sharding Logic:**
```java
int shardNumber = (int) (userId % numberOfShards);
String shardName = "shard_" + shardNumber;
```

#### 2.2 Sharding Framework
- **Option 1**: ShardingSphere (Java)
- **Option 2**: Vitess (Go)
- **Option 3**: Custom sharding logic

**Benefits:**
- Distribute load across shards
- Scale horizontally
- Isolate failures

---

### Phase 3: Multi-Region Deployment (10-20M users)

#### 3.1 Cross-Region Replication
- **Regions**: US-East, US-West, EU, Asia-Pacific
- **Replication**: Async replication between regions
- **Latency**: <100ms for 95% of users

#### 3.2 Regional Databases
- **Primary Region**: Write operations
- **Secondary Regions**: Read replicas
- **Failover**: Automatic failover to secondary region

#### 3.3 Data Locality
- **Strategy**: Route users to nearest region
- **GeoDNS**: Automatic routing
- **Session Affinity**: Sticky sessions

---

### Phase 4: Advanced Optimization (20-30M users)

#### 4.1 Database Partitioning
- **Strategy**: Partition large tables by date/user
- **Benefits**: 
  - Faster queries
  - Easier archival
  - Parallel processing

**Example:**
```sql
CREATE TABLE test_results (
    id BIGINT,
    user_id BIGINT,
    created_at DATETIME,
    -- other columns
) PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    -- ... monthly partitions
);
```

#### 4.2 Index Optimization
- **Strategy**: 
  - Composite indexes for common queries
  - Covering indexes
  - Partial indexes
- **Monitoring**: Track index usage

#### 4.3 Query Optimization
- **Slow Query Log**: Monitor slow queries
- **Query Analysis**: EXPLAIN plans
- **Optimization**: Rewrite inefficient queries
- **Caching**: Cache query results

---

## Infrastructure Requirements

### Database Servers
- **Shards**: 8 MySQL clusters
- **Per Shard**: 
  - 1 Primary (32 vCPU, 128GB RAM, 20TB SSD)
  - 2 Replicas (16 vCPU, 64GB RAM, 20TB SSD)
- **Total**: 24 database servers

### Storage
- **Hot Storage**: 160TB (SSD)
- **Cold Storage**: 500TB (S3/OSS)
- **Backup Storage**: 200TB

### Network
- **Bandwidth**: 10Gbps per region
- **Latency**: <1ms within region, <100ms cross-region

---

## Performance Targets

### Response Times
- **Read Queries**: <50ms (p95)
- **Write Queries**: <100ms (p95)
- **Complex Queries**: <500ms (p95)

### Throughput
- **Read Operations**: 100,000/sec
- **Write Operations**: 10,000/sec
- **Connections**: 10,000 concurrent

### Availability
- **Uptime**: 99.99%
- **RTO**: <5 minutes
- **RPO**: <1 minute

---

## Cost Estimation (Monthly)

### Database Servers
- 24 servers × $2,000 = **$48,000**

### Storage
- Hot storage: **$8,000**
- Cold storage: **$2,000**
- Backup storage: **$1,000**

### Network
- Bandwidth: **$2,000**

### **Total**: ~$61,000/month

---

## Migration Plan

### Week 1-2: Read Replicas
1. Set up master-slave replication
2. Configure read replicas
3. Update application to use replicas

### Week 3-4: Database Sharding
1. Set up sharding infrastructure
2. Migrate existing data
3. Update application to use sharding

### Week 5-8: Multi-Region
1. Deploy to second region
2. Set up cross-region replication
3. Configure GeoDNS
4. Test failover

### Week 9-12: Optimization
1. Implement partitioning
2. Optimize indexes
3. Optimize queries
4. Deploy monitoring

---

## Monitoring & Alerts

### Key Metrics
- **Query Latency**: p50, p95, p99
- **Connection Pool Usage**: Monitor utilization
- **Replication Lag**: <1 second
- **Disk Usage**: <80%
- **CPU Usage**: <70%

### Alerting
- **Critical**: Query latency >1s, Replication lag >10s, Disk usage >90%
- **Warning**: Connection pool >80%, CPU usage >80%

---

## Backup & Recovery

### Backup Strategy
- **Full Backup**: Daily
- **Incremental Backup**: Every 6 hours
- **Retention**: 30 days
- **Storage**: S3/OSS

### Recovery Strategy
- **Point-in-Time Recovery**: Supported
- **RTO**: <1 hour
- **RPO**: <15 minutes

---

## Success Metrics

- ✅ Support 30M users
- ✅ Query latency <50ms (p95)
- ✅ 99.99% uptime
- ✅ Handle 100K reads/sec
- ✅ RTO <5 minutes

