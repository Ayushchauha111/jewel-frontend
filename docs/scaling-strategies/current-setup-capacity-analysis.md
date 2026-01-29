# Current Setup Capacity Analysis
## Oracle Cloud Free Tier + Netlify

---

## Current Infrastructure

### Backend (Oracle Cloud)
- **Shape**: VM.Standard.A1.Flex
- **OCPUs**: 4 (ARM-based)
- **Memory**: 24 GB
- **Network Bandwidth**: 4 Gbps
- **Storage**: Block storage (likely 200GB free tier)
- **Instance Type**: Paravirtualized

### Frontend (Netlify)
- **Hosting**: Static site hosting
- **CDN**: Global CDN included
- **Bandwidth**: Free tier limits apply

---

## Capacity Analysis

### Resource Constraints

#### 1. CPU Capacity (4 OCPUs)
```
Single Application Instance:
- Spring Boot app: ~0.5-1 OCPU per instance
- Database (MySQL): ~1-2 OCPUs
- Redis: ~0.5 OCPU
- Other services: ~0.5 OCPU

Realistic Setup:
- MySQL: 1 OCPU
- Redis: 0.5 OCPU
- Application: 2 OCPUs (2-4 instances)
- Buffer: 0.5 OCPU

Max Concurrent Requests: ~500-1000/sec
```

#### 2. Memory Capacity (24 GB)
```
Memory Allocation:
- MySQL: 8 GB (buffer pool)
- Redis: 4 GB
- Application (4 instances): 8 GB (2 GB each)
- OS & Buffer: 4 GB

Total: 24 GB ✓
```

#### 3. Network Bandwidth (4 Gbps)
```
4 Gbps = 500 MB/sec = 50,000 KB/sec

Per Request (average):
- API Response: ~10 KB
- Static Assets: ~50 KB (cached on CDN)

Capacity:
- API Requests: ~5,000/sec (if 10KB each)
- Realistic: ~2,000-3,000/sec (with overhead)
```

#### 4. Database Connections
```
MySQL Connection Pool:
- Max connections: ~500-1000
- Per application instance: 50-100
- With 4 instances: 200-400 connections
- Remaining for other services: 100-300

Capacity: ~500-1000 concurrent database operations
```

---

## User Capacity Estimation

### Assumptions
- **Daily Active Users (DAU)**: 20% of total users
- **Peak Concurrent Users**: 5% of DAU
- **Average Requests per User**: 10 requests/minute during active session
- **Session Duration**: 10 minutes average

### Calculation

#### Scenario 1: Light Usage (Typing Practice)
```
Peak Concurrent Users: 500
Requests per user per minute: 5
Total Requests/sec: (500 × 5) / 60 = ~42 req/sec

Capacity: ✅ Can handle easily
Estimated Users: ~10,000 total users
```

#### Scenario 2: Moderate Usage (Active Testing)
```
Peak Concurrent Users: 1,000
Requests per user per minute: 10
Total Requests/sec: (1000 × 10) / 60 = ~167 req/sec

Capacity: ✅ Can handle
Estimated Users: ~20,000 total users
```

#### Scenario 3: Heavy Usage (Peak Times)
```
Peak Concurrent Users: 2,000
Requests per user per minute: 15
Total Requests/sec: (2000 × 15) / 60 = ~500 req/sec

Capacity: ⚠️ Near limit (70-80% utilization)
Estimated Users: ~40,000 total users
```

#### Scenario 4: Maximum Capacity
```
Peak Concurrent Users: 3,000
Requests per user per minute: 20
Total Requests/sec: (3000 × 20) / 60 = ~1,000 req/sec

Capacity: ⚠️ At limit (90-95% utilization)
Estimated Users: ~60,000 total users
Risk: High chance of failures during spikes
```

---

## Realistic Capacity (Without Failures)

### Recommended Capacity
```
✅ Safe Operating Range:
- Peak Concurrent Users: 1,500-2,000
- Requests per second: 300-500 req/sec
- Total Users: 30,000-40,000
- CPU Utilization: 60-70%
- Memory Utilization: 70-80%
- Network Utilization: 50-60%

This provides:
- 20-30% headroom for spikes
- Stable performance
- Low failure rate (<0.1%)
```

### Maximum Capacity (With Risk)
```
⚠️ Maximum (Not Recommended):
- Peak Concurrent Users: 2,500-3,000
- Requests per second: 800-1,000 req/sec
- Total Users: 50,000-60,000
- CPU Utilization: 85-95%
- Memory Utilization: 85-95%
- Network Utilization: 70-80%

Risks:
- High failure rate during spikes (>1%)
- Slow response times
- Potential downtime
- Database connection exhaustion
```

---

## Bottlenecks & Limitations

### 1. CPU Bottleneck
```
4 OCPUs (ARM) = ~2-3 Intel vCPUs equivalent
- ARM processors are efficient but slower per core
- Database operations are CPU-intensive
- Limited concurrent processing

Solution: Optimize queries, use caching
```

### 2. Database Connections
```
MySQL max_connections: Typically 151-500 on free tier
- Each user session may need 1-2 connections
- Connection pool exhaustion is a major risk

Solution: 
- Connection pooling (HikariCP)
- Read replicas (if possible)
- Connection timeout management
```

### 3. Memory Constraints
```
24 GB seems sufficient, but:
- MySQL buffer pool needs optimization
- Redis memory limits
- Application memory leaks

Solution: Monitor memory usage closely
```

### 4. Network Bandwidth
```
4 Gbps is good, but:
- Burst traffic can saturate
- Database replication (if any) uses bandwidth
- File uploads/downloads

Solution: Use CDN for static assets (Netlify)
```

### 5. Storage I/O
```
Block storage on free tier:
- Limited IOPS (Input/Output Operations Per Second)
- Database writes can be slow
- Log file growth

Solution: Optimize database, archive old data
```

---

## Netlify Capacity

### Free Tier Limits
```
✅ Bandwidth: 100 GB/month
✅ Build Minutes: 300 minutes/month
✅ Concurrent Builds: 1

For 30,000-40,000 users:
- Average page views: 5 per user per day
- Total page views: 150,000-200,000/day
- Bandwidth per page: ~500 KB (with CDN caching)
- Daily bandwidth: ~75-100 GB/day
- Monthly: ~2.25-3 TB/month

⚠️ Free tier insufficient for this traffic
Need: Pro plan ($19/month) or higher
```

---

## Failure Points

### Critical Failure Scenarios

#### 1. Database Connection Exhaustion
```
Symptom: "Too many connections" error
Trigger: >500 concurrent database operations
Impact: Complete service failure
Prevention: Connection pooling, read replicas
```

#### 2. CPU Saturation
```
Symptom: Slow response times (>2 seconds)
Trigger: >90% CPU utilization
Impact: Timeouts, user frustration
Prevention: Optimize queries, caching
```

#### 3. Memory Exhaustion
```
Symptom: Out of memory errors, crashes
Trigger: >95% memory usage
Impact: Service crashes, data loss risk
Prevention: Memory monitoring, optimization
```

#### 4. Network Saturation
```
Symptom: Slow downloads, timeouts
Trigger: >80% bandwidth usage
Impact: Poor user experience
Prevention: CDN usage, compression
```

---

## Recommendations

### Immediate Optimizations (Free)

1. **Database Optimization**
   ```sql
   - Add proper indexes
   - Optimize slow queries
   - Enable query cache
   - Tune buffer pool size
   ```

2. **Caching Strategy**
   ```
   - Implement Redis caching
   - Cache frequently accessed data
   - Use CDN for static assets (Netlify)
   - Cache API responses
   ```

3. **Connection Pooling**
   ```properties
   spring.datasource.hikari.maximum-pool-size=50
   spring.datasource.hikari.minimum-idle=10
   ```

4. **Application Optimization**
   ```
   - Enable compression (gzip)
   - Optimize JSON responses
   - Use pagination
   - Lazy loading
   ```

### When to Upgrade

#### Upgrade Triggers:
```
⚠️ Upgrade when you reach:
- 30,000+ users (approaching safe limit)
- 500+ concurrent users regularly
- CPU >70% consistently
- Memory >80% consistently
- Database connections >80% of max
- Response times >500ms (p95)
```

#### Upgrade Options:

**Option 1: Oracle Cloud Paid Tier**
```
- Upgrade to better shape: VM.Standard.E4.Flex
- 8 OCPUs, 64GB RAM: ~$200/month
- Capacity: 100,000+ users
```

**Option 2: Add Read Replica**
```
- Second instance for database reads
- Cost: ~$100/month
- Capacity: 60,000+ users
```

**Option 3: Microservices Split**
```
- Separate database instance
- Separate application instances
- Cost: ~$300/month
- Capacity: 100,000+ users
```

---

## Monitoring Checklist

### Key Metrics to Monitor

```
✅ CPU Utilization: <70% (target), <90% (alert)
✅ Memory Utilization: <80% (target), <95% (alert)
✅ Database Connections: <80% of max
✅ Response Time: <200ms (p95), <500ms (p99)
✅ Error Rate: <0.1%
✅ Network Bandwidth: <60% (target), <80% (alert)
✅ Disk I/O: Monitor for bottlenecks
✅ Active Connections: Track growth
```

### Tools
```
- Oracle Cloud Monitoring (free)
- Application logs
- Database slow query log
- Netlify Analytics
```

---

## Final Answer

### **Safe Capacity: 30,000-40,000 Users**

```
✅ Can handle without failures:
- Peak Concurrent: 1,500-2,000 users
- Daily Active: 6,000-8,000 users
- Total Users: 30,000-40,000 users
- CPU: 60-70% utilization
- Memory: 70-80% utilization
- Failure Rate: <0.1%
```

### **Maximum Capacity: 50,000-60,000 Users**

```
⚠️ With risk of failures:
- Peak Concurrent: 2,500-3,000 users
- Daily Active: 10,000-12,000 users
- Total Users: 50,000-60,000 users
- CPU: 85-95% utilization
- Memory: 85-95% utilization
- Failure Rate: 1-5% during spikes
```

### **Netlify Consideration**

```
⚠️ Free tier insufficient for 30K+ users
Required: Pro plan ($19/month) or higher
- Bandwidth: 400 GB/month (Pro)
- Or: 1 TB/month (Business)
```

---

## Action Plan

### Phase 1: Current Setup (0-30K users)
```
✅ Optimize database queries
✅ Implement Redis caching
✅ Configure connection pooling
✅ Monitor key metrics
✅ Use Netlify Pro plan
```

### Phase 2: Optimization (30K-50K users)
```
✅ Add database indexes
✅ Implement read replicas (if possible)
✅ Optimize application code
✅ Add monitoring alerts
```

### Phase 3: Upgrade (50K+ users)
```
✅ Upgrade Oracle Cloud instance
✅ Or migrate to scalable architecture
✅ Implement microservices
✅ Add load balancing
```

---

## Summary

**Your current Oracle Cloud free tier setup can safely handle:**
- **30,000-40,000 total users**
- **1,500-2,000 concurrent users**
- **300-500 requests/second**

**With optimizations, you can push to:**
- **50,000-60,000 total users** (with some risk)

**Critical: Upgrade Netlify to Pro plan for 30K+ users**

