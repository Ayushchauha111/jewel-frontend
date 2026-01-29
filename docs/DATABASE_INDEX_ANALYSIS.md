# Database Index Analysis & Recommendations

## Overview
This document identifies all indexes needed for optimal database performance across all tables. Indexes are critical for:
- Fast lookups on foreign keys
- Efficient filtering on WHERE clauses
- Quick sorting on ORDER BY
- Optimized JOIN operations
- Range queries on dates/timestamps

---

## 1. USERS Table

### Existing Indexes
- ✅ `username` (UNIQUE) - Already indexed
- ✅ `email` (UNIQUE) - Already indexed

### Recommended Indexes
```sql
-- For referral code lookups
CREATE INDEX idx_users_referral_code ON users(referralCode);

-- For reset token lookups (password reset)
CREATE INDEX idx_users_reset_token ON users(resetToken);

-- For token version (session management)
CREATE INDEX idx_users_token_version ON users(token_version);
```

---

## 2. TEST_RESULTS Table

### Foreign Keys (Auto-indexed by JPA)
- ✅ `user_id` - Indexed via FK
- ✅ `test_id` - Indexed via FK

### Recommended Indexes
```sql
-- Composite index for user + test queries (most common)
CREATE INDEX idx_test_results_user_test ON test_results(user_id, test_id);

-- For user's test history (ordered by date)
CREATE INDEX idx_test_results_user_created ON test_results(user_id, created_at DESC);

-- For test leaderboards
CREATE INDEX idx_test_results_test_created ON test_results(test_id, created_at DESC);

-- For type filtering
CREATE INDEX idx_test_results_type ON test_results(type);

-- Composite for type + user queries
CREATE INDEX idx_test_results_type_user ON test_results(type, user_id);
```

---

## 3. FRIENDSHIPS Table

### Foreign Keys
- ✅ `sender_id` - Indexed via FK
- ✅ `receiver_id` - Indexed via FK

### Recommended Indexes
```sql
-- Composite for bidirectional friendship lookup (CRITICAL - most common query)
CREATE INDEX idx_friendships_sender_receiver ON friendships(sender_id, receiver_id);
CREATE INDEX idx_friendships_receiver_sender ON friendships(receiver_id, sender_id);

-- For status filtering (pending requests, accepted friends)
CREATE INDEX idx_friendships_receiver_status ON friendships(receiver_id, status);
CREATE INDEX idx_friendships_sender_status ON friendships(sender_id, status);

-- Composite for friend list queries
CREATE INDEX idx_friendships_status_created ON friendships(status, created_at DESC);
```

---

## 4. CHAT_MESSAGES Table

### Foreign Keys
- ✅ `sender_id` - Indexed via FK
- ✅ `receiver_id` - Indexed via FK

### Recommended Indexes
```sql
-- Composite for conversation queries (CRITICAL - bidirectional)
CREATE INDEX idx_chat_sender_receiver_created ON chat_messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_chat_receiver_sender_created ON chat_messages(receiver_id, sender_id, created_at);

-- For unread message counts
CREATE INDEX idx_chat_receiver_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;

-- For recent conversations
CREATE INDEX idx_chat_created_desc ON chat_messages(created_at DESC);
```

---

## 5. FOREST_SESSIONS Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK

### Existing Indexes
- ✅ `(user_id, session_date)` - UNIQUE constraint

### Recommended Indexes
```sql
-- For daily leaderboard (ordered by trees/focus minutes)
CREATE INDEX idx_forest_session_date_trees ON forest_sessions(session_date, trees_planted DESC, total_focus_minutes DESC);

-- For user's session history
CREATE INDEX idx_forest_user_date ON forest_sessions(user_id, session_date DESC);

-- For date-based queries
CREATE INDEX idx_forest_session_date ON forest_sessions(session_date);
```

---

## 6. STUDY_ROOM_SESSIONS Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK
- ✅ `room_id` - Indexed via FK

### Recommended Indexes
```sql
-- Composite for user + room + confirmation status (CRITICAL - most common query)
CREATE INDEX idx_room_sessions_user_room_confirmed ON study_room_sessions(user_id, room_id, is_confirmed);

-- For cleanup task (unconfirmed sessions)
CREATE INDEX idx_room_sessions_confirmed_expires ON study_room_sessions(is_confirmed, expires_at);

-- For room participant count
CREATE INDEX idx_room_sessions_room_confirmed ON study_room_sessions(room_id, is_confirmed);

-- For link opened time (cleanup queries)
CREATE INDEX idx_room_sessions_link_opened ON study_room_sessions(link_opened_at) WHERE is_confirmed = false;
```

---

## 7. TYPING_RACES Table

### Foreign Keys
- ✅ `host_id` - Indexed via FK

### Existing Indexes
- ✅ `room_code` - UNIQUE constraint

### Recommended Indexes
```sql
-- For status-based queries (WAITING, IN_PROGRESS, etc.)
CREATE INDEX idx_races_status_created ON typing_races(status, created_at DESC);

-- For host's race history
CREATE INDEX idx_races_host_created ON typing_races(host_id, created_at DESC);

-- Composite for active races
CREATE INDEX idx_races_status_time ON typing_races(status, started_at);
```

---

## 8. RACE_PARTICIPANTS Table

### Foreign Keys
- ✅ `race_id` - Indexed via FK
- ✅ `user_id` - Indexed via FK

### Existing Indexes
- ✅ `(race_id, user_id)` - UNIQUE constraint

### Recommended Indexes
```sql
-- For race leaderboard (ordered by position/WPM)
CREATE INDEX idx_race_participants_race_position ON race_participants(race_id, position ASC, wpm DESC);

-- For user's race history
CREATE INDEX idx_race_participants_user_joined ON race_participants(user_id, joined_at DESC);

-- For finished participants count
CREATE INDEX idx_race_participants_race_finished ON race_participants(race_id, finished);
```

---

## 9. TOURNAMENTS Table

### Recommended Indexes
```sql
-- For status filtering (CRITICAL - most common query)
CREATE INDEX idx_tournaments_status ON tournaments(status);

-- For active tournaments (status + time)
CREATE INDEX idx_tournaments_status_start ON tournaments(status, start_time);

-- For time-based queries
CREATE INDEX idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX idx_tournaments_end_time ON tournaments(end_time);

-- Composite for registration period
CREATE INDEX idx_tournaments_registration ON tournaments(status, registration_start, start_time);
```

---

## 10. TOURNAMENT_PARTICIPANTS Table

### Foreign Keys
- ✅ `tournament_id` - Indexed via FK
- ✅ `user_id` - Indexed via FK

### Existing Indexes
- ✅ `(tournament_id, user_id)` - UNIQUE constraint

### Recommended Indexes
```sql
-- For tournament leaderboard (ordered by WPM)
CREATE INDEX idx_tournament_participants_tournament_wpm ON tournament_participants(tournament_id, best_wpm DESC);

-- For user's tournament history
CREATE INDEX idx_tournament_participants_user_registered ON tournament_participants(user_id, registered_at DESC);

-- For completed participants
CREATE INDEX idx_tournament_participants_tournament_completed ON tournament_participants(tournament_id, completed);
```

---

## 11. DAILY_CHALLENGES Table

### Existing Indexes
- ✅ `challenge_date` - UNIQUE constraint

### Recommended Indexes
```sql
-- For date range queries (last 7 days, etc.)
CREATE INDEX idx_daily_challenges_date_desc ON daily_challenges(challenge_date DESC);

-- For category/difficulty filtering
CREATE INDEX idx_daily_challenges_category ON daily_challenges(category);
CREATE INDEX idx_daily_challenges_difficulty ON daily_challenges(difficulty);
```

---

## 12. DAILY_CHALLENGE_ATTEMPTS Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK
- ✅ `challenge_id` - Indexed via FK

### Existing Indexes
- ✅ `(user_id, challenge_id)` - UNIQUE constraint

### Recommended Indexes
```sql
-- For challenge leaderboard (ordered by WPM)
CREATE INDEX idx_challenge_attempts_challenge_wpm ON daily_challenge_attempts(challenge_id, wpm DESC);

-- For user's attempt history
CREATE INDEX idx_challenge_attempts_user_completed ON daily_challenge_attempts(user_id, completed_at DESC);

-- For challenge participant count
CREATE INDEX idx_challenge_attempts_challenge ON daily_challenge_attempts(challenge_id);
```

---

## 13. USER_TYPING_COURSES Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK
- ✅ `typing_course_id` - Indexed via FK

### Recommended Indexes
```sql
-- For user's enrolled courses (active subscriptions)
CREATE INDEX idx_user_courses_user_expires ON user_typing_courses(user_id, expires_at);

-- For course enrollment list
CREATE INDEX idx_user_courses_course ON user_typing_courses(typing_course_id);

-- Composite for active subscriptions
CREATE INDEX idx_user_courses_active ON user_typing_courses(user_id, expires_at) WHERE expires_at >= CURRENT_DATE;
```

---

## 14. USER_STREAKS Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK

### Recommended Indexes
```sql
-- For leaderboards (CRITICAL - frequently queried)
CREATE INDEX idx_user_streaks_current_streak ON user_streaks(current_streak DESC);
CREATE INDEX idx_user_streaks_total_xp ON user_streaks(total_xp DESC);
CREATE INDEX idx_user_streaks_level ON user_streaks(level DESC);

-- For active streaks
CREATE INDEX idx_user_streaks_active ON user_streaks(current_streak DESC) WHERE current_streak > 0;
```

---

## 15. USER_ACHIEVEMENTS Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK
- ✅ `achievement_id` - Indexed via FK

### Existing Indexes
- ✅ `(user_id, achievement_id)` - UNIQUE constraint

### Recommended Indexes
```sql
-- For user's achievements
CREATE INDEX idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at DESC);

-- For showcased achievements
CREATE INDEX idx_user_achievements_user_showcased ON user_achievements(user_id, showcased) WHERE showcased = true;

-- For achievement rarity (count queries)
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
```

---

## 16. BLOG_POSTS Table

### Existing Indexes
- ✅ `slug` - UNIQUE constraint

### Recommended Indexes
```sql
-- For published posts (CRITICAL - most common query)
CREATE INDEX idx_blog_posts_published_created ON blog_posts(published, created_at DESC);

-- For featured/trending posts
CREATE INDEX idx_blog_posts_featured_published ON blog_posts(featured, published, published_at DESC);
CREATE INDEX idx_blog_posts_trending_views ON blog_posts(trending, published, view_count DESC);

-- For category filtering
CREATE INDEX idx_blog_posts_category_published ON blog_posts(category, published, created_at DESC);

-- For search queries (title/content)
CREATE INDEX idx_blog_posts_title_search ON blog_posts(title(255)); -- Prefix index for LIKE queries
-- Note: Full-text search requires FULLTEXT index (MySQL) or GIN index (PostgreSQL)

-- For series posts
CREATE INDEX idx_blog_posts_series ON blog_posts(series_name, series_order) WHERE series_name IS NOT NULL;
```

---

## 17. ROOM_USAGE Table

### Foreign Keys
- ✅ `room_id` - Indexed via FK

### Recommended Indexes
```sql
-- For analytics queries (CRITICAL - time-based aggregations)
CREATE INDEX idx_room_usage_room_recorded ON room_usage(room_id, recorded_at);

-- For date range queries
CREATE INDEX idx_room_usage_recorded ON room_usage(recorded_at);

-- For hourly/daily aggregations
CREATE INDEX idx_room_usage_room_hour ON room_usage(room_id, hour_of_day);
CREATE INDEX idx_room_usage_room_day ON room_usage(room_id, day_of_week);
```

---

## 18. STUDY_ROOMS Table

### Recommended Indexes
```sql
-- For room type + active status (CRITICAL - most common query)
CREATE INDEX idx_study_rooms_type_active_priority ON study_rooms(room_type, is_active, priority DESC);

-- For available rooms query
CREATE INDEX idx_study_rooms_active_capacity ON study_rooms(is_active, current_participants, max_capacity);

-- For platform filtering
CREATE INDEX idx_study_rooms_platform ON study_rooms(platform);
```

---

## 19. TESTS Table

### Foreign Keys
- ✅ `typing_course_id` - Indexed via FK

### Recommended Indexes
```sql
-- For course's tests
CREATE INDEX idx_tests_course ON tests(typing_course_id);
```

---

## 20. TYPING_COURSES Table

### Foreign Keys
- ✅ `course_id` - Indexed via FK

### Recommended Indexes
```sql
-- For course's typing courses
CREATE INDEX idx_typing_courses_course ON typing_courses(course_id);
```

---

## 21. FEEDBACK Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK (nullable)

### Recommended Indexes
```sql
-- For approved feedback display
CREATE INDEX idx_feedback_approved_created ON feedbacks(is_approved, created_at DESC);

-- For user's feedback
CREATE INDEX idx_feedback_user ON feedbacks(user_id) WHERE user_id IS NOT NULL;
```

---

## 22. COMMUNITY_CONFIG Table

### Recommended Indexes
```sql
-- For config key lookup (CRITICAL - most common query)
CREATE INDEX idx_community_config_key ON community_configs(config_key);

-- For active configs by type
CREATE INDEX idx_community_config_type_active ON community_configs(config_type, is_active);

-- For display order
CREATE INDEX idx_community_config_active_order ON community_configs(is_active, display_order);
```

---

## 23. FEATURE_FLAGS Table

### Recommended Indexes
```sql
-- For feature key lookup (CRITICAL - most common query)
CREATE INDEX idx_feature_flags_key ON feature_flags(feature_key);

-- For enabled features
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;

-- For category filtering
CREATE INDEX idx_feature_flags_category ON feature_flags(category);
```

---

## 24. STUDY_BUDDIES Table

### Foreign Keys
- ✅ `user_id` - Indexed via FK

### Existing Indexes
- ✅ `user_id` - UNIQUE constraint

### Recommended Indexes
```sql
-- For exam-based search
CREATE INDEX idx_study_buddies_exam_active ON study_buddies(exam, is_active);

-- For availability search
CREATE INDEX idx_study_buddies_availability ON study_buddies(availability, is_active);
```

---

## 25. NEWSLETTER_SUBSCRIBERS Table

### Existing Indexes
- ✅ `email` - UNIQUE constraint

### Recommended Indexes
```sql
-- For subscribed users
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscribers(subscribed) WHERE subscribed = true;
```

---

## 26. COUPONS Table

### Existing Indexes
- ✅ `code` - UNIQUE constraint

### Recommended Indexes
```sql
-- For active coupons (not expired)
CREATE INDEX idx_coupons_expiry ON coupons(expiry_date) WHERE expiry_date >= CURRENT_DATE;
```

---

## Implementation Priority

### 🔴 CRITICAL (Implement First)
1. `friendships` - Bidirectional composite indexes
2. `chat_messages` - Conversation lookup indexes
3. `test_results` - User + test composite
4. `study_room_sessions` - User + room + confirmed composite
5. `tournaments` - Status index
6. `blog_posts` - Published + created index
7. `community_configs` - Config key index
8. `feature_flags` - Feature key index

### 🟡 HIGH (Implement Second)
1. `user_streaks` - Leaderboard indexes
2. `forest_sessions` - Date + trees composite
3. `room_usage` - Room + recorded_at
4. `typing_races` - Status + created
5. `race_participants` - Race + position
6. `tournament_participants` - Tournament + WPM

### 🟢 MEDIUM (Implement Third)
1. All remaining foreign key indexes (if not auto-created)
2. Date-based indexes for time-series queries
3. Status/enum filtering indexes

---

## SQL Script for All Indexes

```sql
-- Run this script to create all recommended indexes
-- Note: Adjust for your database (MySQL/PostgreSQL)

-- USERS
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referralCode);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(resetToken);
CREATE INDEX IF NOT EXISTS idx_users_token_version ON users(token_version);

-- TEST_RESULTS
CREATE INDEX IF NOT EXISTS idx_test_results_user_test ON test_results(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_created ON test_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_test_created ON test_results(test_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_type ON test_results(type);
CREATE INDEX IF NOT EXISTS idx_test_results_type_user ON test_results(type, user_id);

-- FRIENDSHIPS
CREATE INDEX IF NOT EXISTS idx_friendships_sender_receiver ON friendships(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver_sender ON friendships(receiver_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver_status ON friendships(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_sender_status ON friendships(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_status_created ON friendships(status, created_at DESC);

-- CHAT_MESSAGES
CREATE INDEX IF NOT EXISTS idx_chat_sender_receiver_created ON chat_messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_receiver_sender_created ON chat_messages(receiver_id, sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_receiver_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_chat_created_desc ON chat_messages(created_at DESC);

-- FOREST_SESSIONS
CREATE INDEX IF NOT EXISTS idx_forest_session_date_trees ON forest_sessions(session_date, trees_planted DESC, total_focus_minutes DESC);
CREATE INDEX IF NOT EXISTS idx_forest_user_date ON forest_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_forest_session_date ON forest_sessions(session_date);

-- STUDY_ROOM_SESSIONS
CREATE INDEX IF NOT EXISTS idx_room_sessions_user_room_confirmed ON study_room_sessions(user_id, room_id, is_confirmed);
CREATE INDEX IF NOT EXISTS idx_room_sessions_confirmed_expires ON study_room_sessions(is_confirmed, expires_at);
CREATE INDEX IF NOT EXISTS idx_room_sessions_room_confirmed ON study_room_sessions(room_id, is_confirmed);
CREATE INDEX IF NOT EXISTS idx_room_sessions_link_opened ON study_room_sessions(link_opened_at) WHERE is_confirmed = false;

-- TYPING_RACES
CREATE INDEX IF NOT EXISTS idx_races_status_created ON typing_races(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_races_host_created ON typing_races(host_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_races_status_time ON typing_races(status, started_at);

-- RACE_PARTICIPANTS
CREATE INDEX IF NOT EXISTS idx_race_participants_race_position ON race_participants(race_id, position ASC, wpm DESC);
CREATE INDEX IF NOT EXISTS idx_race_participants_user_joined ON race_participants(user_id, joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_participants_race_finished ON race_participants(race_id, finished);

-- TOURNAMENTS
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status_start ON tournaments(status, start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_end_time ON tournaments(end_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration ON tournaments(status, registration_start, start_time);

-- TOURNAMENT_PARTICIPANTS
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_wpm ON tournament_participants(tournament_id, best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_registered ON tournament_participants(user_id, registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_completed ON tournament_participants(tournament_id, completed);

-- DAILY_CHALLENGES
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_desc ON daily_challenges(challenge_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_category ON daily_challenges(category);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_difficulty ON daily_challenges(difficulty);

-- DAILY_CHALLENGE_ATTEMPTS
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge_wpm ON daily_challenge_attempts(challenge_id, wpm DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_completed ON daily_challenge_attempts(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge ON daily_challenge_attempts(challenge_id);

-- USER_TYPING_COURSES
CREATE INDEX IF NOT EXISTS idx_user_courses_user_expires ON user_typing_courses(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_courses_course ON user_typing_courses(typing_course_id);

-- USER_STREAKS
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_total_xp ON user_streaks(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_level ON user_streaks(level DESC);

-- USER_ACHIEVEMENTS
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- BLOG_POSTS
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON blog_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured_published ON blog_posts(featured, published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_trending_views ON blog_posts(trending, published, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published ON blog_posts(category, published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_series ON blog_posts(series_name, series_order) WHERE series_name IS NOT NULL;

-- ROOM_USAGE
CREATE INDEX IF NOT EXISTS idx_room_usage_room_recorded ON room_usage(room_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_room_usage_recorded ON room_usage(recorded_at);
CREATE INDEX IF NOT EXISTS idx_room_usage_room_hour ON room_usage(room_id, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_room_usage_room_day ON room_usage(room_id, day_of_week);

-- STUDY_ROOMS
CREATE INDEX IF NOT EXISTS idx_study_rooms_type_active_priority ON study_rooms(room_type, is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_study_rooms_active_capacity ON study_rooms(is_active, current_participants, max_capacity);
CREATE INDEX IF NOT EXISTS idx_study_rooms_platform ON study_rooms(platform);

-- TESTS
CREATE INDEX IF NOT EXISTS idx_tests_course ON tests(typing_course_id);

-- TYPING_COURSES
CREATE INDEX IF NOT EXISTS idx_typing_courses_course ON typing_courses(course_id);

-- FEEDBACK
CREATE INDEX IF NOT EXISTS idx_feedback_approved_created ON feedbacks(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedbacks(user_id) WHERE user_id IS NOT NULL;

-- COMMUNITY_CONFIG
CREATE INDEX IF NOT EXISTS idx_community_config_key ON community_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_community_config_type_active ON community_configs(config_type, is_active);
CREATE INDEX IF NOT EXISTS idx_community_config_active_order ON community_configs(is_active, display_order);

-- FEATURE_FLAGS
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);

-- STUDY_BUDDIES
CREATE INDEX IF NOT EXISTS idx_study_buddies_exam_active ON study_buddies(exam, is_active);
CREATE INDEX IF NOT EXISTS idx_study_buddies_availability ON study_buddies(availability, is_active);

-- NEWSLETTER_SUBSCRIBERS
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(subscribed) WHERE subscribed = true;

-- COUPONS
CREATE INDEX IF NOT EXISTS idx_coupons_expiry ON coupons(expiry_date) WHERE expiry_date >= CURRENT_DATE;
```

---

## Notes

1. **Foreign Key Indexes**: JPA/Hibernate typically auto-creates indexes on foreign keys, but verify with your database.

2. **Partial Indexes**: Some databases (PostgreSQL) support partial indexes (WHERE clauses). MySQL doesn't support them natively, so those can be skipped or implemented differently.

3. **Full-Text Search**: For blog post search, consider FULLTEXT indexes (MySQL) or GIN indexes (PostgreSQL) on `title`, `content`, and `excerpt`.

4. **Index Maintenance**: Monitor index usage and remove unused indexes. Too many indexes can slow down INSERT/UPDATE operations.

5. **Composite Index Order**: The order of columns in composite indexes matters. Put the most selective column first.

6. **Database-Specific**: Adjust syntax for your database (MySQL, PostgreSQL, etc.).

---

## Performance Impact

- **Query Speed**: 10-1000x faster for indexed queries
- **Write Performance**: Slight overhead (5-10%) on INSERT/UPDATE
- **Storage**: Additional 10-20% disk space
- **Memory**: Indexes are cached in memory for fast access

---

## Monitoring

After implementing indexes, monitor:
1. Query execution times (should decrease significantly)
2. Index usage statistics
3. Write performance (should remain acceptable)
4. Database size growth

