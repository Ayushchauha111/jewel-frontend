# Scaling Strategy for 500K - 1M Users

## Current Load Analysis

### At 500,000 Users:
- **Heartbeat requests**: 500,000 req/min = **8,333 req/sec** ⚠️
- **Database connections**: ~10,000+ concurrent
- **Memory**: ~50GB+ for in-memory rate limiting
- **Network**: ~1.5 Gbps bandwidth

### At 1,000,000 Users:
- **Heartbeat requests**: 1,000,000 req/min = **16,666 req/sec** ⚠️⚠️
- **Database connections**: ~20,000+ concurrent
- **Memory**: ~100GB+ for in-memory rate limiting
- **Network**: ~3 Gbps bandwidth

## Critical Issues at This Scale

1. **Single Server Bottleneck**: Cannot handle 8K-16K req/sec
2. **Database Overload**: MySQL will crash with 10K+ connections
3. **Memory Exhaustion**: In-memory rate limiting won't work
4. **Network Bandwidth**: Single server can't handle 1.5-3 Gbps
5. **Heartbeat Spam**: Too many API calls

## Required Architecture Changes

### 1. **Horizontal Scaling (Load Balancing)**
```
[Load Balancer (NGINX/AWS ALB)]
    ↓
[App Server 1] [App Server 2] ... [App Server N]
    ↓
[Redis Cluster] [Database Cluster]
```

**Recommendation**: 
- 10-20 app servers (each handling 500-1000 req/sec)
- Auto-scaling based on CPU/memory
- Health checks and failover

### 2. **Redis for Session Management** ⭐ CRITICAL
Replace database heartbeat with Redis:
- **In-memory**: 100x faster than database
- **Distributed**: Works across multiple servers
- **TTL**: Auto-expire sessions
- **Pub/Sub**: Real-time updates

**Benefits**:
- Reduce database load by 99%
- Handle 100K+ concurrent sessions
- Sub-millisecond latency

### 3. **Database Optimization**
- **Connection Pooling**: HikariCP with max 200 connections per server
- **Read Replicas**: Separate read/write databases
- **Sharding**: Partition by user_id or room_id
- **Indexes**: Critical indexes on all query fields

### 4. **Heartbeat Optimization**
Current: 60 seconds per user
**Recommended**: 
- **Batch Heartbeat**: Group updates (100 users per request)
- **Increase interval**: 120-180 seconds (2-3 minutes)
- **WebSocket**: Real-time connection (eliminates polling)
- **Client-side batching**: Send heartbeat only when tab is active

### 5. **Caching Layer**
- **Redis**: Session data, room stats, user presence
- **CDN**: Static assets, API responses
- **Application Cache**: Caffeine/Guava for frequently accessed data

### 6. **Message Queue (Optional)**
For async operations:
- **RabbitMQ/Kafka**: Handle cleanup tasks, analytics
- **Background workers**: Process heavy operations

## Implementation Priority

### Phase 1: Immediate (Can handle 100K users)
1. ✅ Increase heartbeat to 120 seconds
2. ✅ Batch heartbeat updates
3. ✅ Add Redis for session tracking
4. ✅ Database connection pooling
5. ✅ Add database indexes

### Phase 2: Short-term (Can handle 500K users)
1. Load balancer setup
2. 3-5 app servers
3. Redis cluster (3 nodes)
4. Database read replicas
5. CDN for static assets

### Phase 3: Long-term (Can handle 1M+ users)
1. Auto-scaling infrastructure
2. Database sharding
3. WebSocket for real-time updates
4. Message queue for async tasks
5. Monitoring and alerting (Prometheus/Grafana)

## Cost Estimation (AWS)

### For 500K Users:
- **App Servers**: 10 × t3.large = $300/month
- **Redis Cluster**: 3 × cache.t3.medium = $150/month
- **Database**: db.r5.xlarge (multi-AZ) = $500/month
- **Load Balancer**: ALB = $20/month
- **CDN**: CloudFront = $100/month
- **Total**: ~$1,070/month

### For 1M Users:
- **App Servers**: 20 × t3.large = $600/month
- **Redis Cluster**: 3 × cache.t3.large = $300/month
- **Database**: db.r5.2xlarge (multi-AZ) = $1,000/month
- **Load Balancer**: ALB = $20/month
- **CDN**: CloudFront = $200/month
- **Total**: ~$2,120/month

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 100ms | ~50ms |
| Heartbeat Latency | < 10ms | ~20ms |
| Database Query Time | < 50ms | ~30ms |
| Uptime | 99.9% | 99.5% |
| Concurrent Users | 1M | 10K |

## Monitoring Requirements

1. **Application Performance**: New Relic / Datadog
2. **Database**: CloudWatch / MySQL Performance Schema
3. **Redis**: Redis Insight / CloudWatch
4. **Infrastructure**: CloudWatch / Prometheus
5. **Alerts**: PagerDuty / SNS

## Next Steps

1. Implement Redis-based heartbeat (see code changes)
2. Increase heartbeat interval to 120 seconds
3. Add database connection pooling config
4. Set up load balancer
5. Deploy Redis cluster
6. Add monitoring and alerts

