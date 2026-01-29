# Scaling Strategy: Courses & Subscriptions System
## Target: 20-30 Million Users

### Current Architecture
- **Courses**: MySQL `courses` and `typing_courses` tables
- **Subscriptions**: MySQL `user_typing_courses` table
- **Payment**: Razorpay integration
- **Content**: Stored in database

---

## Scaling Challenges

### 1. **Course Catalog**
- **Current**: Single table, direct queries
- **At Scale**: 10,000+ courses, millions of catalog views
- **Bottlenecks**: Database read capacity, search performance

### 2. **Subscription Management**
- **Current**: Single table with unique constraint
- **At Scale**: 30M users × 2 courses avg = 60M subscriptions
- **Bottlenches**: 
  - Subscription queries (user's courses)
  - Expiration date calculations
  - Bulk updates (validity changes)

### 3. **Course Content Delivery**
- **Current**: Database storage
- **At Scale**: High read traffic for course content
- **Bottlenecks**: Database I/O, content size

---

## Scaling Solutions

### Phase 1: Database Optimization (0-5M users)

#### 1.1 Course Table Sharding
- **Shard Key**: `category` or `id` (hash-based)
- **Shards**: 2-4 shards for courses
- **Read Replicas**: 3 per shard

#### 1.2 Subscription Table Partitioning
```sql
-- Partition by user_id hash
CREATE TABLE user_typing_courses (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    typing_course_id BIGINT,
    enrolled_at DATETIME,
    expires_at DATETIME,
    -- other columns
) PARTITION BY HASH(user_id) PARTITIONS 8;
```

**Benefits:**
- Parallel queries across partitions
- Better cache locality
- Easier scaling

#### 1.3 Indexing Strategy
```sql
-- Critical indexes
CREATE INDEX idx_user_courses_user ON user_typing_courses(user_id, enrolled_at DESC);
CREATE INDEX idx_user_courses_expires ON user_typing_courses(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_courses_category ON typing_courses(category);
CREATE INDEX idx_courses_active ON typing_courses(is_active, created_at);
CREATE INDEX idx_courses_search ON typing_courses(title, description) USING FULLTEXT;
```

#### 1.4 Subscription Expiration Optimization
- **Current**: Recalculate on validity change
- **Optimization**: 
  - Pre-calculate expiration dates
  - Batch update with background job
  - Cache active subscriptions

---

### Phase 2: Caching Layer (5-10M users)

#### 2.1 Course Catalog Cache
- **Redis Cache**: Cache all active courses
- **TTL**: 1 hour (courses change infrequently)
- **Cache Key**: `courses:active`, `course:{id}:details`
- **Cache Size**: 5GB for 10K courses

**Implementation:**
```java
@Cacheable(value = "courseCatalog")
public List<TypingCourseDTO> getActiveCourses() {
    // Cache entire catalog
}

@Cacheable(value = "courseDetails", key = "#courseId")
public TypingCourseDTO getCourseDetails(Long courseId) {
    // Cache individual course
}
```

#### 2.2 User Subscription Cache
- **Cache**: User's active subscriptions
- **TTL**: 15 minutes
- **Cache Key**: `user:{userId}:subscriptions`
- **Invalidation**: On subscription change

#### 2.3 Course Content CDN
- **Static Content**: Course descriptions, images
- **CDN**: CloudFront/Cloudflare
- **Edge Locations**: 200+ locations

---

### Phase 3: Search & Discovery (10-20M users)

#### 3.1 Elasticsearch for Course Search
- **Index**: Course title, description, category, tags
- **Features**:
  - Full-text search
  - Faceted search (category, difficulty)
  - Auto-complete suggestions
  - Relevance ranking

**Data Flow:**
```
Course Created/Updated → Kafka → Elasticsearch Indexer → Update Index
User Search → Elasticsearch → Return Results
```

#### 3.2 Recommendation Engine
- **Algorithm**: Collaborative filtering + Content-based
- **Storage**: Redis for user preferences
- **Processing**: Background job (daily)
- **Cache**: Pre-computed recommendations

**Implementation:**
- **User Similarity**: Based on subscription patterns
- **Course Similarity**: Based on content, category
- **Hybrid**: Combine both approaches

---

### Phase 4: Advanced Features (20-30M users)

#### 4.1 Subscription Service (Microservice)
- **Dedicated Service**: Handle all subscription logic
- **Features**:
  - Subscription management
  - Expiration tracking
  - Bulk operations
  - Analytics

#### 4.2 Content Delivery Network (CDN)
- **Course Content**: Videos, PDFs, images
- **Storage**: S3/OSS
- **CDN**: CloudFront for global delivery
- **Optimization**:
  - Video streaming (HLS/DASH)
  - Image optimization (WebP)
  - Compression (gzip/brotli)

#### 4.3 Subscription Analytics
- **Time-Series DB**: InfluxDB for subscription metrics
- **Metrics**:
  - Active subscriptions
  - Expiration trends
  - Popular courses
  - Revenue metrics

---

## Infrastructure Requirements

### Database
- **Course Shards**: 2 MySQL clusters
- **Subscription Shards**: 4 MySQL clusters (partitioned)
- **Per Shard**: 
  - 1 Primary (16 vCPU, 64GB RAM, 5TB SSD)
  - 2 Replicas (8 vCPU, 32GB RAM, 5TB SSD)

### Caching
- **Redis Cluster**: 6 nodes (3 masters + 3 replicas)
- **Per Node**: 32GB RAM, 8 vCPU
- **Total Memory**: 192GB

### Search
- **Elasticsearch Cluster**: 6 nodes
- **Per Node**: 16 vCPU, 64GB RAM, 2TB SSD
- **Index Size**: 50GB

### CDN & Storage
- **CDN**: CloudFront/Cloudflare
- **Object Storage**: S3/OSS (100TB)
- **Bandwidth**: 500GB/day

---

## Performance Targets

### Response Times
- **Course Catalog**: <100ms (p95)
- **Course Details**: <150ms (p95)
- **User Subscriptions**: <200ms (p95)
- **Course Search**: <300ms (p95)

### Throughput
- **Catalog Views**: 100,000/sec
- **Subscription Queries**: 50,000/sec
- **Search Queries**: 10,000/sec

### Availability
- **Uptime**: 99.99%
- **Cache Hit Rate**: >95%

---

## Cost Estimation (Monthly)

### Database
- 6 shards × $2,000 = **$12,000**

### Caching
- Redis cluster: **$3,000**

### Search
- Elasticsearch cluster: **$4,000**

### CDN & Storage
- CDN: **$1,500**
- Object Storage: **$1,000**

### **Total**: ~$21,500/month

---

## Migration Plan

### Week 1-2: Database Optimization
1. Implement table partitioning
2. Add indexes
3. Set up read replicas

### Week 3-4: Caching
1. Deploy Redis cluster
2. Implement course catalog cache
3. Cache user subscriptions

### Week 5-8: Search
1. Set up Elasticsearch
2. Index existing courses
3. Implement search API
4. Real-time indexing via Kafka

### Week 9-12: CDN & Storage
1. Migrate content to S3
2. Set up CDN
3. Optimize content delivery

---

## Monitoring & Alerts

### Key Metrics
- **Catalog Load Time**: <100ms
- **Subscription Query Time**: <200ms
- **Search Latency**: <300ms
- **Cache Hit Rate**: >95%
- **Active Subscriptions**: Monitor growth

### Alerting
- **Critical**: Query latency >500ms, Cache hit rate <90%
- **Warning**: Search latency >500ms, DB connections >70%

---

## Success Metrics

- ✅ Support 60M subscriptions
- ✅ Catalog load <100ms
- ✅ Search results <300ms
- ✅ 99.99% uptime
- ✅ Cache hit rate >95%

