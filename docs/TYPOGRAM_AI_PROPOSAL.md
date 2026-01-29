# Typogram AI - Typing Pattern Analysis System

## Overview
A comprehensive AI-powered typing pattern analysis system that tracks keystroke dynamics, identifies problem areas, and provides personalized improvement suggestions.

---

## 🎯 Core Features

### 1. **Keystroke Dynamics Tracking**
- **Per-key timing**: Time between key presses (dwell time, flight time)
- **Key pressure patterns**: Which keys take longer to type
- **Error patterns**: Which keys cause most mistakes
- **Rhythm analysis**: Typing rhythm consistency
- **Hand position inference**: Left vs right hand performance

### 2. **Pattern Recognition**
- **Weak keys identification**: Keys with highest error rates
- **Speed bottlenecks**: Keys that slow down overall typing
- **Consistency metrics**: Variation in typing speed
- **Error clustering**: Common error sequences
- **Learning curve tracking**: Improvement over time per key

### 3. **AI-Powered Insights**
- **Personalized recommendations**: Based on individual patterns
- **Adaptive practice suggestions**: Focus on problem areas
- **Progress prediction**: Estimate improvement timeline
- **Smart text generation**: Generate practice text targeting weak keys

---

## 📊 Data Model

### New Entity: `KeystrokeAnalytics`

```java
@Entity
@Table(name = "keystroke_analytics")
public class KeystrokeAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "test_result_id")
    private TestResult testResult; // Optional - can be aggregated
    
    // Per-key statistics
    @Type(JsonType.class)
    @Column(name = "key_statistics", columnDefinition = "json")
    private Map<String, KeyStatistics> keyStatistics; // key -> stats
    
    // Overall patterns
    @Column(name = "average_dwell_time")
    private Double averageDwellTime; // Time key is held down
    
    @Column(name = "average_flight_time")
    private Double averageFlightTime; // Time between key releases
    
    @Column(name = "typing_rhythm_consistency")
    private Double rhythmConsistency; // 0-1 score
    
    @Column(name = "weak_keys", columnDefinition = "json")
    private List<String> weakKeys; // Top 10 problematic keys
    
    @Column(name = "strong_keys", columnDefinition = "json")
    private List<String> strongKeys; // Top 10 best keys
    
    @Column(name = "error_clusters", columnDefinition = "json")
    private Map<String, Integer> errorClusters; // Common error sequences
    
    @Column(name = "hand_balance")
    private Double handBalance; // Left vs right hand performance (0-1)
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// Embedded class for per-key stats
@Embeddable
class KeyStatistics {
    private Integer totalPresses;
    private Integer totalErrors;
    private Double averageDwellTime;
    private Double averageFlightTime;
    private Double errorRate; // errors / total presses
    private Double averageSpeed; // WPM when this key is used
    private Integer lastUpdated; // Timestamp
}
```

### Enhanced TestResult Storage

Add to `resultDetails` JSON:
```json
{
  "keystroke_data": {
    "key_timings": [
      {"key": "a", "pressTime": 1234567890, "releaseTime": 1234567895, "nextKeyTime": 1234567900},
      ...
    ],
    "error_keys": ["q", "z", "x"], // Keys with errors
    "slow_keys": ["p", "q"], // Keys with slow response
    "rhythm_score": 0.85
  }
}
```

---

## 🔧 Implementation Plan

### Phase 1: Enhanced Keystroke Tracking (Frontend)

**File: `typogram-frontend/src/components/common/TypingDisplayTests.js`**

Add keystroke tracking:

```javascript
// New state for keystroke analytics
const [keystrokeData, setKeystrokeData] = useState({
  keyTimings: [], // Array of {key, pressTime, releaseTime, nextKeyTime}
  keyErrors: {}, // {key: errorCount}
  keyDwellTimes: {}, // {key: [dwellTime1, dwellTime2, ...]}
  keyFlightTimes: {}, // {key: [flightTime1, flightTime2, ...]}
});

// Enhanced handleKeyDown
const handleKeyDown = (e) => {
  const key = e.key;
  const pressTime = Date.now();
  
  // Track key press
  setKeystrokeData(prev => ({
    ...prev,
    keyTimings: [...prev.keyTimings, {
      key: key,
      pressTime: pressTime,
      releaseTime: null,
      nextKeyTime: null
    }]
  }));
  
  // Calculate flight time (time since last key release)
  if (keystrokeData.keyTimings.length > 0) {
    const lastKey = keystrokeData.keyTimings[keystrokeData.keyTimings.length - 1];
    if (lastKey.releaseTime) {
      const flightTime = pressTime - lastKey.releaseTime;
      // Store flight time for previous key
      setKeystrokeData(prev => ({
        ...prev,
        keyFlightTimes: {
          ...prev.keyFlightTimes,
          [lastKey.key]: [...(prev.keyFlightTimes[lastKey.key] || []), flightTime]
        }
      }));
    }
  }
  
  // Existing backspace tracking...
};

// Enhanced handleKeyUp
const handleKeyUp = (e) => {
  const key = e.key;
  const releaseTime = Date.now();
  
  // Find the most recent press of this key
  const keyTimings = keystrokeData.keyTimings;
  for (let i = keyTimings.length - 1; i >= 0; i--) {
    if (keyTimings[i].key === key && !keyTimings[i].releaseTime) {
      const dwellTime = releaseTime - keyTimings[i].pressTime;
      
      // Update timing
      setKeystrokeData(prev => {
        const newTimings = [...prev.keyTimings];
        newTimings[i].releaseTime = releaseTime;
        return {
          ...prev,
          keyTimings: newTimings,
          keyDwellTimes: {
            ...prev.keyDwellTimes,
            [key]: [...(prev.keyDwellTimes[key] || []), dwellTime]
          }
        };
      });
      break;
    }
  }
};

// Track errors per key
const trackKeyError = (key) => {
  setKeystrokeData(prev => ({
    ...prev,
    keyErrors: {
      ...prev.keyErrors,
      [key]: (prev.keyErrors[key] || 0) + 1
    }
  }));
};
```

### Phase 2: Backend Analytics Service

**File: `typogram-backend/src/main/java/com/example/typogram/demo/service/TypingAnalyticsService.java`**

```java
@Service
public class TypingAnalyticsService {
    
    @Autowired
    private KeystrokeAnalyticsRepository keystrokeAnalyticsRepository;
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    /**
     * Analyze keystroke data and generate insights
     */
    public KeystrokeAnalytics analyzeKeystrokePatterns(Long userId, Map<String, Object> keystrokeData) {
        // Extract key timings
        List<Map<String, Object>> keyTimings = (List<Map<String, Object>>) keystrokeData.get("key_timings");
        Map<String, Integer> keyErrors = (Map<String, Integer>) keystrokeData.get("key_errors");
        
        // Calculate per-key statistics
        Map<String, KeyStatistics> keyStats = calculateKeyStatistics(keyTimings, keyErrors);
        
        // Identify weak keys (highest error rate + slowest)
        List<String> weakKeys = identifyWeakKeys(keyStats);
        
        // Identify strong keys
        List<String> strongKeys = identifyStrongKeys(keyStats);
        
        // Calculate rhythm consistency
        Double rhythmConsistency = calculateRhythmConsistency(keyTimings);
        
        // Calculate hand balance
        Double handBalance = calculateHandBalance(keyStats);
        
        // Find error clusters
        Map<String, Integer> errorClusters = findErrorClusters(keyTimings, keyErrors);
        
        // Create analytics record
        KeystrokeAnalytics analytics = KeystrokeAnalytics.builder()
            .user(userRepository.findById(userId).orElseThrow())
            .keyStatistics(keyStats)
            .weakKeys(weakKeys)
            .strongKeys(strongKeys)
            .rhythmConsistency(rhythmConsistency)
            .handBalance(handBalance)
            .errorClusters(errorClusters)
            .averageDwellTime(calculateAverageDwellTime(keyStats))
            .averageFlightTime(calculateAverageFlightTime(keyStats))
            .build();
        
        return keystrokeAnalyticsRepository.save(analytics);
    }
    
    /**
     * Get user's typing pattern insights
     */
    public Map<String, Object> getUserInsights(Long userId) {
        List<KeystrokeAnalytics> recentAnalytics = keystrokeAnalyticsRepository
            .findTop10ByUserIdOrderByCreatedAtDesc(userId);
        
        if (recentAnalytics.isEmpty()) {
            return Map.of("message", "No analytics data available");
        }
        
        // Aggregate insights from recent tests
        Map<String, Object> insights = aggregateInsights(recentAnalytics);
        
        // Generate AI recommendations
        insights.put("recommendations", generateRecommendations(insights));
        
        // Generate practice text targeting weak keys
        insights.put("practiceText", generatePracticeText(insights));
        
        return insights;
    }
    
    /**
     * Generate AI-powered practice text targeting weak keys
     */
    private String generatePracticeText(Map<String, Object> insights) {
        List<String> weakKeys = (List<String>) insights.get("weakKeys");
        
        // Generate text that frequently uses weak keys
        // This could use AI/ML model or rule-based generation
        return generateTextWithKeyFrequency(weakKeys, 200); // 200 words
    }
    
    /**
     * Generate personalized recommendations
     */
    private List<String> generateRecommendations(Map<String, Object> insights) {
        List<String> recommendations = new ArrayList<>();
        
        List<String> weakKeys = (List<String>) insights.get("weakKeys");
        Double rhythmConsistency = (Double) insights.get("rhythmConsistency");
        Double handBalance = (Double) insights.get("handBalance");
        
        // Key-specific recommendations
        if (!weakKeys.isEmpty()) {
            recommendations.add(String.format(
                "Focus on practicing these keys: %s. They have the highest error rates.",
                String.join(", ", weakKeys.subList(0, Math.min(5, weakKeys.size())))
            ));
        }
        
        // Rhythm recommendations
        if (rhythmConsistency < 0.7) {
            recommendations.add("Your typing rhythm is inconsistent. Try to maintain a steady pace.");
        }
        
        // Hand balance recommendations
        if (handBalance < 0.4 || handBalance > 0.6) {
            recommendations.add("One hand is significantly slower. Practice exercises focusing on the weaker hand.");
        }
        
        return recommendations;
    }
}
```

### Phase 3: AI-Powered Text Generation

**File: `typogram-backend/src/main/java/com/example/typogram/demo/service/AITextGenerationService.java`**

```java
@Service
public class AITextGenerationService {
    
    /**
     * Generate practice text that targets specific weak keys
     */
    public String generateTargetedPracticeText(List<String> weakKeys, int wordCount) {
        // Option 1: Rule-based generation (simple, fast)
        return generateRuleBasedText(weakKeys, wordCount);
        
        // Option 2: AI model generation (advanced)
        // return generateAIText(weakKeys, wordCount);
    }
    
    /**
     * Rule-based text generation focusing on weak keys
     */
    private String generateRuleBasedText(List<String> weakKeys, int wordCount) {
        // Create word lists that heavily use weak keys
        Map<String, List<String>> keyWords = new HashMap<>();
        
        // Pre-defined word lists for each key
        keyWords.put("q", Arrays.asList("quick", "question", "quality", "quiet", "quota"));
        keyWords.put("z", Arrays.asList("zone", "zero", "zebra", "zoom", "zeal"));
        // ... more key-word mappings
        
        StringBuilder text = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < wordCount; i++) {
            // 60% chance to use a weak key word
            if (random.nextDouble() < 0.6 && !weakKeys.isEmpty()) {
                String weakKey = weakKeys.get(random.nextInt(weakKeys.size()));
                List<String> words = keyWords.getOrDefault(weakKey, Arrays.asList("the", "and", "for"));
                text.append(words.get(random.nextInt(words.size())));
            } else {
                // Regular words
                text.append(getRandomWord());
            }
            
            if (i < wordCount - 1) {
                text.append(" ");
            }
        }
        
        return text.toString();
    }
    
    /**
     * Advanced: Use AI model (OpenAI, Anthropic, or local model)
     */
    private String generateAIText(List<String> weakKeys, int wordCount) {
        // Integration with AI service
        // Prompt: "Generate a 200-word practice text that frequently uses these keys: q, z, x"
        // Call AI API and return generated text
        return callAIService(weakKeys, wordCount);
    }
}
```

### Phase 4: Frontend UI Components

**File: `typogram-frontend/src/components/features/TypogramAI/TypingInsights.js`**

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiTarget, FiZap, FiBarChart2, 
  FiAlertCircle, FiCheckCircle, FiLightbulb 
} from 'react-icons/fi';
import TypingAnalyticsService from '../../../service/typingAnalytics.service';

const InsightsContainer = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  margin: 2rem 0;
`;

const WeakKeysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const KeyCard = styled(motion.div)`
  background: ${props => props.isWeak ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 255, 136, 0.2)'};
  border: 2px solid ${props => props.isWeak ? '#ff4444' : '#00ff88'};
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
`;

const RecommendationCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TypingInsights = ({ userId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      const response = await TypingAnalyticsService.getUserInsights(userId);
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading insights...</div>;
  if (!insights) return <div>No insights available. Complete a typing test first.</div>;

  return (
    <InsightsContainer>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiZap /> Typogram AI Insights
      </h2>

      {/* Weak Keys Section */}
      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiAlertCircle /> Keys You Struggle With
        </h3>
        <WeakKeysGrid>
          {insights.weakKeys?.map((key, index) => (
            <KeyCard
              key={key}
              isWeak={true}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {key.toUpperCase()}
            </KeyCard>
          ))}
        </WeakKeysGrid>
      </section>

      {/* Strong Keys Section */}
      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiCheckCircle /> Your Strong Keys
        </h3>
        <WeakKeysGrid>
          {insights.strongKeys?.map((key, index) => (
            <KeyCard
              key={key}
              isWeak={false}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {key.toUpperCase()}
            </KeyCard>
          ))}
        </WeakKeysGrid>
      </section>

      {/* Metrics */}
      <section style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div>
          <FiBarChart2 /> Rhythm Consistency
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {(insights.rhythmConsistency * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <FiTarget /> Hand Balance
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {(insights.handBalance * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <FiTrendingUp /> Average Speed
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {insights.averageSpeed || 0} WPM
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiLightbulb /> AI Recommendations
        </h3>
        {insights.recommendations?.map((rec, index) => (
          <RecommendationCard key={index}>
            <FiLightbulb />
            <span>{rec}</span>
          </RecommendationCard>
        ))}
      </section>

      {/* Practice Text */}
      {insights.practiceText && (
        <section style={{ marginTop: '2rem' }}>
          <h3>AI-Generated Practice Text (Targeting Your Weak Keys)</h3>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.2)', 
            padding: '1rem', 
            borderRadius: '10px',
            marginTop: '1rem'
          }}>
            {insights.practiceText}
          </div>
          <button style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Start Practice Session
          </button>
        </section>
      )}
    </InsightsContainer>
  );
};

export default TypingInsights;
```

---

## 📍 Integration Points

### 1. **Profile Page**
- Add "Typing Insights" tab
- Show weak keys, strong keys, recommendations
- Display progress over time

### 2. **Test Results Page**
- Show "View AI Insights" button after test completion
- Display per-key performance breakdown
- Show error patterns

### 3. **Home Page / Dashboard**
- Add "Typogram AI" card (like Bolt AI)
- Quick stats: "You struggle with Q, Z, X keys"
- Link to full insights page

### 4. **Practice Mode**
- "AI-Powered Practice" option
- Generates text targeting weak keys
- Real-time feedback on problem keys

### 5. **Admin Panel**
- Analytics dashboard
- User typing pattern trends
- Most problematic keys across all users

---

## 🚀 Implementation Steps

### Step 1: Database Schema
1. Create `keystroke_analytics` table
2. Add `keystroke_data` JSON field to `test_results.result_details`
3. Create indexes on `user_id`, `created_at`

### Step 2: Backend Services
1. Create `KeystrokeAnalytics` entity
2. Create `TypingAnalyticsService`
3. Create `AITextGenerationService`
4. Add API endpoints:
   - `POST /api/analytics/analyze` - Analyze test result
   - `GET /api/analytics/insights/{userId}` - Get user insights
   - `GET /api/analytics/practice-text/{userId}` - Get practice text

### Step 3: Frontend Tracking
1. Enhance `TypingDisplayTests.js` with keystroke tracking
2. Send keystroke data to backend on test completion
3. Create `TypingInsights.js` component
4. Create `TypingAnalyticsService.js` for API calls

### Step 4: UI Integration
1. Add insights to Profile page
2. Add AI card to Home page
3. Add insights button to Results page
4. Create dedicated "Typogram AI" page

### Step 5: AI Enhancement (Optional)
1. Integrate with OpenAI/Anthropic for text generation
2. Use ML model for pattern prediction
3. Advanced recommendations using NLP

---

## 📊 Metrics to Track

1. **Per-Key Metrics:**
   - Error rate per key
   - Average dwell time per key
   - Average flight time per key
   - Speed when using each key

2. **Pattern Metrics:**
   - Rhythm consistency
   - Hand balance (left vs right)
   - Error clusters (common sequences)
   - Improvement rate per key

3. **Overall Metrics:**
   - Weak keys ranking
   - Strong keys ranking
   - Overall typing health score
   - Progress trajectory

---

## 🎨 UI/UX Design

### Color Scheme:
- **Weak Keys**: Red/Orange gradient
- **Strong Keys**: Green gradient
- **Insights Card**: Purple gradient (like Bolt AI)
- **Recommendations**: Yellow/Amber accent

### Components:
1. **Key Heatmap**: Visual representation of key performance
2. **Progress Charts**: Line/bar charts showing improvement
3. **Recommendation Cards**: Actionable suggestions
4. **Practice Text Generator**: One-click practice session

---

## 🔮 Future Enhancements

1. **Real-time Feedback**: Show weak keys highlighted during typing
2. **Gamification**: Unlock achievements for improving weak keys
3. **Social Comparison**: Compare patterns with friends
4. **Advanced AI**: Predict typing speed improvement timeline
5. **Voice Integration**: Audio feedback for problem keys
6. **Keyboard Layout Optimization**: Suggest optimal layout for user

---

## 📝 API Endpoints

```java
// Analyze keystroke data from test
POST /api/analytics/analyze
Body: { testResultId, keystrokeData }

// Get user insights
GET /api/analytics/insights/{userId}

// Get AI-generated practice text
GET /api/analytics/practice-text/{userId}?focusKeys=q,z,x

// Get per-key statistics
GET /api/analytics/key-stats/{userId}?key=q

// Get progress over time
GET /api/analytics/progress/{userId}?days=30
```

---

This system will provide deep insights into typing patterns and help users improve systematically by focusing on their specific weaknesses!

