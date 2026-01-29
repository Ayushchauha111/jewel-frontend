-- MySQL-Compatible Index Creation Script
-- Note: MySQL doesn't support IF NOT EXISTS for CREATE INDEX
-- Run this script carefully - indexes that already exist will cause errors
-- You can ignore "Duplicate key name" errors if indexes already exist

-- ============================================
-- USERS
-- ============================================
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_users_token_version ON users(token_version);

-- ============================================
-- TEST_RESULTS
-- ============================================
CREATE INDEX idx_test_results_user_test ON test_results(user_id, test_id);
CREATE INDEX idx_test_results_user_created ON test_results(user_id, created_at);
CREATE INDEX idx_test_results_test_created ON test_results(test_id, created_at);
CREATE INDEX idx_test_results_type ON test_results(type);
CREATE INDEX idx_test_results_type_user ON test_results(type, user_id);

-- ============================================
-- FRIENDSHIPS
-- ============================================
CREATE INDEX idx_friendships_sender_receiver ON friendships(sender_id, receiver_id);
CREATE INDEX idx_friendships_receiver_sender ON friendships(receiver_id, sender_id);
CREATE INDEX idx_friendships_receiver_status ON friendships(receiver_id, status);
CREATE INDEX idx_friendships_sender_status ON friendships(sender_id, status);
CREATE INDEX idx_friendships_status_created ON friendships(status, created_at);

-- ============================================
-- CHAT_MESSAGES
-- ============================================
CREATE INDEX idx_chat_sender_receiver_created ON chat_messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_chat_receiver_sender_created ON chat_messages(receiver_id, sender_id, created_at);
CREATE INDEX idx_chat_receiver_unread ON chat_messages(receiver_id, is_read);
CREATE INDEX idx_chat_created_desc ON chat_messages(created_at);

-- ============================================
-- FOREST_SESSIONS
-- ============================================
CREATE INDEX idx_forest_session_date_trees ON forest_sessions(session_date, trees_planted, total_focus_minutes);
CREATE INDEX idx_forest_user_date ON forest_sessions(user_id, session_date);
CREATE INDEX idx_forest_session_date ON forest_sessions(session_date);

-- ============================================
-- STUDY_ROOM_SESSIONS
-- ============================================
CREATE INDEX idx_room_sessions_user_room_confirmed ON study_room_sessions(user_id, room_id, is_confirmed);
CREATE INDEX idx_room_sessions_confirmed_expires ON study_room_sessions(is_confirmed, expires_at);
CREATE INDEX idx_room_sessions_room_confirmed ON study_room_sessions(room_id, is_confirmed);
CREATE INDEX idx_room_sessions_link_opened ON study_room_sessions(link_opened_at);

-- ============================================
-- TYPING_RACES
-- ============================================
CREATE INDEX idx_races_status_created ON typing_races(status, created_at);
CREATE INDEX idx_races_host_created ON typing_races(host_id, created_at);
CREATE INDEX idx_races_status_time ON typing_races(status, started_at);

-- ============================================
-- RACE_PARTICIPANTS
-- ============================================
CREATE INDEX idx_race_participants_race_position ON race_participants(race_id, position, wpm);
CREATE INDEX idx_race_participants_user_joined ON race_participants(user_id, joined_at);
CREATE INDEX idx_race_participants_race_finished ON race_participants(race_id, finished);

-- ============================================
-- TOURNAMENTS
-- ============================================
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_status_start ON tournaments(status, start_time);
CREATE INDEX idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX idx_tournaments_end_time ON tournaments(end_time);
CREATE INDEX idx_tournaments_registration ON tournaments(status, registration_start, start_time);

-- ============================================
-- TOURNAMENT_PARTICIPANTS
-- ============================================
CREATE INDEX idx_tournament_participants_tournament_wpm ON tournament_participants(tournament_id, best_wpm);
CREATE INDEX idx_tournament_participants_user_registered ON tournament_participants(user_id, registered_at);
CREATE INDEX idx_tournament_participants_tournament_completed ON tournament_participants(tournament_id, completed);

-- ============================================
-- DAILY_CHALLENGES
-- ============================================
CREATE INDEX idx_daily_challenges_date_desc ON daily_challenges(challenge_date);
CREATE INDEX idx_daily_challenges_category ON daily_challenges(category);
CREATE INDEX idx_daily_challenges_difficulty ON daily_challenges(difficulty);

-- ============================================
-- DAILY_CHALLENGE_ATTEMPTS
-- ============================================
CREATE INDEX idx_challenge_attempts_challenge_wpm ON daily_challenge_attempts(challenge_id, wpm);
CREATE INDEX idx_challenge_attempts_user_completed ON daily_challenge_attempts(user_id, completed_at);
CREATE INDEX idx_challenge_attempts_challenge ON daily_challenge_attempts(challenge_id);

-- ============================================
-- USER_TYPING_COURSES
-- ============================================
CREATE INDEX idx_user_courses_user_expires ON user_typing_courses(user_id, expires_at);
CREATE INDEX idx_user_courses_course ON user_typing_courses(typing_course_id);

-- ============================================
-- USER_STREAKS
-- ============================================
CREATE INDEX idx_user_streaks_current_streak ON user_streaks(current_streak);
CREATE INDEX idx_user_streaks_total_xp ON user_streaks(total_xp);
CREATE INDEX idx_user_streaks_level ON user_streaks(level);

-- ============================================
-- USER_ACHIEVEMENTS
-- ============================================
CREATE INDEX idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- ============================================
-- BLOG_POSTS
-- ============================================
CREATE INDEX idx_blog_posts_published_created ON blog_posts(published, created_at);
CREATE INDEX idx_blog_posts_featured_published ON blog_posts(featured, published, published_at);
CREATE INDEX idx_blog_posts_trending_views ON blog_posts(trending, published, view_count);
CREATE INDEX idx_blog_posts_category_published ON blog_posts(category, published, created_at);
CREATE INDEX idx_blog_posts_series ON blog_posts(series_name, series_order);

-- ============================================
-- ROOM_USAGE
-- ============================================
CREATE INDEX idx_room_usage_room_recorded ON room_usage(room_id, recorded_at);
CREATE INDEX idx_room_usage_recorded ON room_usage(recorded_at);
CREATE INDEX idx_room_usage_room_hour ON room_usage(room_id, hour_of_day);
CREATE INDEX idx_room_usage_room_day ON room_usage(room_id, day_of_week);

-- ============================================
-- STUDY_ROOMS
-- ============================================
CREATE INDEX idx_study_rooms_type_active_priority ON study_rooms(room_type, is_active, priority);
CREATE INDEX idx_study_rooms_active_capacity ON study_rooms(is_active, current_participants, max_capacity);
CREATE INDEX idx_study_rooms_platform ON study_rooms(platform);

-- ============================================
-- TESTS
-- ============================================
CREATE INDEX idx_tests_course ON tests(typing_course_id);

-- ============================================
-- TYPING_COURSES
-- ============================================
CREATE INDEX idx_typing_courses_course ON typing_courses(course_id);

-- ============================================
-- FEEDBACK
-- ============================================
CREATE INDEX idx_feedback_approved_created ON feedbacks(is_approved, created_at);
CREATE INDEX idx_feedback_user ON feedbacks(user_id);

-- ============================================
-- COMMUNITY_CONFIG
-- ============================================
CREATE INDEX idx_community_config_key ON community_configs(config_key);
CREATE INDEX idx_community_config_type_active ON community_configs(config_type, is_active);
CREATE INDEX idx_community_config_active_order ON community_configs(is_active, display_order);

-- ============================================
-- FEATURE_FLAGS
-- ============================================
CREATE INDEX idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX idx_feature_flags_category ON feature_flags(category);

-- ============================================
-- STUDY_BUDDIES
-- ============================================
CREATE INDEX idx_study_buddies_exam_active ON study_buddies(exam, is_active);
CREATE INDEX idx_study_buddies_availability ON study_buddies(availability, is_active);

-- ============================================
-- NEWSLETTER_SUBSCRIBERS
-- ============================================
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscribers(subscribed);

-- ============================================
-- COUPONS (Table may not exist - comment out if needed)
-- ============================================
-- CREATE INDEX idx_coupons_expiry ON coupons(expiry_date);

-- ============================================
-- END OF SCRIPT
-- ============================================
-- Note: If you get "Duplicate key name" errors, those indexes already exist
-- You can safely ignore those errors or use the following to check existing indexes:
-- SHOW INDEX FROM table_name;

