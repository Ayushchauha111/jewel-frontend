# Scaling Strategy: Email System
## Target: 20-30 Million Users

### Current Architecture
- **Storage**: MySQL `email_history` table
- **Sending**: Direct email service integration
- **Templates**: Database storage
- **Tracking**: Email history logging

---

## Scaling Challenges

### 1. **Email Sending**
- **Current**: Synchronous sending
- **At Scale**: 10M+ emails/day
- **Bottlenecks**: 
  - Email service rate limits
  - Sending latency
  - Delivery tracking

### 2. **Email History Storage**
- **Current**: Single table
- **At Scale**: 10M emails/day = 300M/month
- **Bottlenecks**: 
  - Database write load
  - Storage growth
  - Query performance

### 3. **Bulk Email Operations**
- **Current**: Sequential sending
- **At Scale**: 1M+ recipients per campaign
- **Bottlenecks**: 
  - Processing time
  - Rate limiting
  - Delivery tracking

---

## Scaling Solutions

### Phase 1: Database Optimization (0-5M users)

#### 1.1 Email History Partitioning
```sql
-- Partition by date (monthly partitions)
CREATE TABLE email_history (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    email_type VARCHAR(50),
    status VARCHAR(50),
    sent_at DATETIME,
    -- other columns
) PARTITION BY RANGE (TO_DAYS(sent_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    -- ... monthly partitions
);
```

#### 1.2 Indexing Strategy
```sql
CREATE INDEX idx_email_history_user ON email_history(user_id, sent_at DESC);
CREATE INDEX idx_email_history_status ON email_history(status, sent_at);
CREATE INDEX idx_email_history_type ON email_history(email_type, sent_at);
```

---

### Phase 2: Asynchronous Processing (5-10M users)

#### 2.1 Email Queue
- **Queue**: Apache Kafka
- **Topic**: `email-send` (100 partitions)
- **Flow**:
```
Email Request → Send to Queue → Email Worker → Send Email → Update Status → Log History
```

**Message Format:**
```json
{
  "userId": 12345,
  "emailType": "welcome",
  "recipient": "user@example.com",
  "templateData": {...},
  "priority": "high"
}
```

#### 2.2 Email Processing Workers
- **Workers**: 100-200 instances
- **Processing**:
  - Send emails via email service
  - Handle retries
  - Update delivery status
  - Log to history
  - Handle bounces/complaints

**Worker Configuration:**
- **Auto-scaling**: Based on queue depth
- **Rate Limiting**: Respect email service limits
- **Retry Logic**: Exponential backoff
- **Dead Letter Queue**: Failed emails for manual review

#### 2.3 Email Service Abstraction
- **Service**: Email service abstraction layer
- **Support**: Multiple providers (SendGrid, SES, etc.)
- **Benefits**: 
  - Failover capability
  - Load distribution
  - Provider-specific optimizations

---

### Phase 3: Bulk Email Optimization (10-20M users)

#### 3.1 Batch Processing
- **Strategy**: Process emails in batches
- **Batch Size**: 1,000 emails per batch
- **Parallel Processing**: Multiple batches simultaneously
- **Rate Limiting**: Respect provider limits

#### 3.2 Email Template Caching
- **Redis Cache**: Cache email templates
- **TTL**: 24 hours
- **Cache Key**: `email:template:{type}`
- **Benefits**: Faster template rendering

#### 3.3 Delivery Tracking
- **Webhooks**: Receive delivery events from email service
- **Queue**: Separate Kafka topic for webhooks
- **Processing**: Update email status in background
- **Storage**: Time-series DB for delivery metrics

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Email Analytics
- **Time-Series DB**: InfluxDB for email metrics
- **Metrics**:
  - Send rates
  - Delivery rates
  - Open rates
  - Click rates
  - Bounce rates

#### 4.2 Personalization
- **Algorithm**: Dynamic content based on user data
- **Storage**: User preferences in Redis
- **Processing**: Real-time personalization

#### 4.3 A/B Testing
- **Framework**: Test different email variants
- **Storage**: Test results in database
- **Analytics**: Track performance metrics

#### 4.4 Email Archival
- **Hot Storage**: Last 90 days in MySQL
- **Cold Storage**: Older emails in S3/OSS
- **Query**: Query hot storage, archive cold storage

---

## Infrastructure Requirements

### Database
- **MySQL Cluster**: 2 nodes
- **Per Node**: 
  - 1 Primary (16 vCPU, 64GB RAM, 10TB SSD)
  - 2 Replicas (8 vCPU, 32GB RAM, 10TB SSD)

### Message Queue
- **Kafka Cluster**: 9 brokers
- **Per Broker**: 16 vCPU, 64GB RAM, 2TB SSD
- **Topics**: 
  - `email-send` (100 partitions)
  - `email-webhooks` (20 partitions)

### Processing Workers
- **Workers**: 200 instances (auto-scaling)
- **Per Instance**: 4 vCPU, 8GB RAM
- **Platform**: Kubernetes

### Caching
- **Redis Cluster**: 3 nodes (1 master + 2 replicas)
- **Per Node**: 16GB RAM, 4 vCPU
- **Total Memory**: 48GB

### Storage
- **Hot Storage**: 50TB (MySQL)
- **Cold Storage**: 200TB (S3/OSS)

---

## Performance Targets

### Response Times
- **Email Queue**: <100ms (p95)
- **Email Sending**: <5 seconds (async)
- **Email History Query**: <200ms (p95)

### Throughput
- **Email Sends**: 100,000/hour
- **Bulk Campaigns**: 1M recipients/hour
- **Daily Volume**: 10M emails/day

### Availability
- **Uptime**: 99.99%
- **Delivery Rate**: >99%

---

## Cost Estimation (Monthly)

### Database
- MySQL cluster: **$3,000**

### Message Queue
- Kafka cluster: **$9,000**

### Processing Workers
- 200 instances × $80 = **$16,000**

### Caching
- Redis cluster: **$1,000**

### Storage
- Hot storage: **$2,000**
- Cold storage: **$1,000**

### Email Service
- SendGrid/SES: **$5,000** (based on volume)

### **Total**: ~$37,000/month

---

## Migration Plan

### Week 1-2: Database Optimization
1. Implement table partitioning
2. Add indexes
3. Set up read replicas

### Week 3-4: Asynchronous Processing
1. Set up Kafka cluster
2. Implement email queue
3. Deploy email workers
4. Migrate to async sending

### Week 5-8: Bulk Email
1. Implement batch processing
2. Set up template caching
3. Implement delivery tracking
4. Optimize bulk operations

### Week 9-12: Advanced Features
1. Set up email analytics
2. Implement personalization
3. Set up A/B testing
4. Deploy monitoring

---

## Monitoring & Alerts

### Key Metrics
- **Email Send Rate**: Monitor throughput
- **Delivery Rate**: >99%
- **Queue Depth**: Monitor backlog
- **Bounce Rate**: <5%
- **Complaint Rate**: <0.1%

### Alerting
- **Critical**: Delivery rate <95%, Queue depth >100K, Bounce rate >10%
- **Warning**: Send latency >10s, Complaint rate >0.5%

---

## Success Metrics

- ✅ Send 10M emails/day
- ✅ Delivery rate >99%
- ✅ Email queue <100ms
- ✅ 99.99% uptime
- ✅ Support 1M recipients/hour

