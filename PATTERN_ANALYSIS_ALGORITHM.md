# Pattern Analysis Algorithm Documentation

**Purpose**: Explain how the insights engine detects behavioral patterns  
**Location**: `lib/analysis/patternAnalysis.ts`  
**Core Value**: Transforms raw decision data into human-understandable patterns

---

## Overview

The pattern analysis engine processes decisions and reviews to extract 4 behavioral insights. Each insight detects a specific thinking pattern.

**Data Requirements**: Minimum 5 completed decision→review cycles

---

## Insight #1: Confidence Calibration

### Algorithm

```
For each reviewed decision:
  1. Get confidence at decision time (0-100)
  2. Get outcome comparison (worse/as_expected/better)
  
  IF confidence >= 70:
    IF outcome is worse:
      COUNT as "overconfident"
    ELSE:
      COUNT as "well-calibrated"
  
  ELSE IF confidence <= 40:
    IF outcome is better:
      COUNT as "underconfident"
    ELSE:
      COUNT as "well-calibrated"

Calculate average confidence across all decisions

Detect pattern:
  IF overconfident_count > 40% of total:
    Message: "You tend to be more confident than reality supports"
  ELSE IF underconfident_count > 40% of total:
    Message: "You tend to underestimate what you can do"
  ELSE:
    Message: Based on average confidence level
```

### Why This Matters

Confidence is the **strongest signal of thinking quality**.

- **Overconfident** users make decisions too quickly
- **Underconfident** users miss opportunities
- **Well-calibrated** users grow in judgment over time

### Example

```
Decision 1: Confidence 85% → Outcome worse than expected
Decision 2: Confidence 90% → Outcome worse than expected
Decision 3: Confidence 45% → Outcome better than expected
Decision 4: Confidence 30% → Outcome as expected
Decision 5: Confidence 75% → Outcome as expected

Result: 2 overconfident, 1 underconfident, 2 well-calibrated
Average: 65%

Output: "You're usually quite confident. But watch for overconfidence."
```

---

## Insight #2: Surprise Patterns (Blind Spot Detection)

### Algorithm

```
For each reviewed decision:
  1. Get surprise_score (0-100)
  2. Get decision_type (personal/work/finance/health/other)

Group surprise scores by decision_type:
  surprise_by_domain = {
    personal: [45, 67, 23],
    work: [12, 15, 8],
    finance: [78, 82, 61],
    health: []
  }

Calculate average surprise per domain:
  domain_averages = {
    personal: 45,
    work: 12,
    finance: 74,
    health: (no data)
  }

Overall surprise = average of all surprise scores

Detect pattern:
  IF domain with highest surprise > 60:
    Message: "You're frequently surprised by [domain] decisions"
  ELSE IF clear difference between domains:
    Message: "You handle [strong domain] well but [weak domain] surprises you"
  ELSE:
    Message: Based on overall surprise score
```

### Why This Matters

**Surprise = broken mental model**

When someone is surprised by outcome, it means their prediction was wrong. This reveals:
- Wrong assumptions
- Blind spots
- Missing information
- Incorrect mental models

### Example

```
Personal decisions: surprise_scores = [45, 67, 52, 70] → avg 58
Work decisions: surprise_scores = [12, 8, 15] → avg 12
Finance decisions: surprise_scores = [88, 92, 78] → avg 86

Result: Finance decisions cause high surprise (broken model)
        Personal decisions cause moderate surprise (some blind spots)
        Work decisions are predictable (good model)

Output: "You're strong in work judgment, but finance surprises you most.
         This is where learning happens."
```

---

## Insight #3: Speed vs Regret Pattern

### Algorithm

```
Partition reviewed decisions by decision_speed:
  quick_decisions = [dec1, dec3, dec7]
  moderate_decisions = [dec2, dec5]
  slow_decisions = [dec4, dec6]

For each partition, calculate regret rate:
  regret_rate = (decisions with would_repeat='no') / total * 100

  quick_regret_rate = 2/3 = 67%
  moderate_regret_rate = 0/2 = 0%
  slow_regret_rate = 1/2 = 50%

Detect pattern:
  IF quick_regret > 50% AND quick_count >= 3:
    Message: "You often regret quick decisions"
  ELSE IF slow_regret > 50% AND slow_count >= 3:
    Message: "You overthink. Quick decisions work out better"
  ELSE IF quick_regret < 30% AND quick_count >= 3:
    Message: "You're good at quick decisions. Trust instincts"
```

### Why This Matters

This is the **most actionable insight**. It directly reveals self-sabotaging behavior.

- **"I regret fast decisions"** → User should slow down
- **"I regret slow decisions"** → User should trust instincts
- **"No correlation"** → Speed isn't the issue

### Example

```
Quick decisions: 3/5 regretted = 60% regret rate
Moderate decisions: 1/4 regretted = 25% regret rate  
Slow decisions: 2/3 regretted = 67% regret rate

Result: High regret on BOTH quick AND slow decisions
        This means speed isn't the issue

Output: "Your speed and regret aren't linked. Focus on OTHER factors."
```

---

## Insight #4: Repeat Rate (Satisfaction)

### Algorithm

```
For each reviewed decision:
  IF would_repeat = 'yes':
    COUNT as repeat
  ELSE IF would_repeat = 'no':
    COUNT as regret
  ELSE IF would_repeat = 'unsure':
    COUNT as unsure

repeat_rate = (repeat_count / total) * 100

Detect pattern:
  IF repeat_rate > 75%:
    Message: "You're satisfied with most decisions"
  ELSE IF repeat_rate > 50%:
    Message: "You'd repeat about half"
  ELSE IF repeat_rate < 30%:
    Message: "You regret many decisions (this shows learning)"
  ELSE:
    Message: "You're roughly split"
```

### Why This Matters

Shows overall **satisfaction and learning orientation**.

- **High repeat rate** (75%+) = Good judgment
- **Low repeat rate** (30%-) = Lots of learning
- **Medium repeat rate** (50%) = Mixed results

High regret isn't bad—it means user is learning from mistakes.

### Example

```
5 decisions reviewed:
  Decision 1: would_repeat = yes
  Decision 2: would_repeat = no
  Decision 3: would_repeat = yes
  Decision 4: would_repeat = unsure
  Decision 5: would_repeat = no

Repeat: 2, Regret: 2, Unsure: 1
Repeat rate: 2/5 = 40%

Output: "You're roughly split on repeating decisions.
         The ones you wouldn't repeat hold lessons."
```

---

## Data Structures

### Input: Decisions Array
```typescript
{
  id: string;
  confidence: number;        // 0-100
  decision_type: DecisionType;
  decision_speed: DecisionSpeed;
  created_at: Date;
  // ... other fields
}
```

### Input: Reviews Array
```typescript
{
  decision_id: string;
  expectation_comparison: ExpectationComparison;  // worse/as_expected/better
  surprise_score: number;    // 0-100
  would_repeat: WouldRepeat; // yes/no/unsure
  reviewed_at: Date;
  // ... other fields
}
```

### Output: Insights Object
```typescript
{
  confidence: ConfidenceInsight | null;
  surprise: SurpriseInsight | null;
  speed: SpeedInsight | null;
  repeat: RepeatInsight | null;
  reviewCount: number;
  minimumReviewsNeeded: number;
}
```

---

## Edge Cases & Handling

### Insufficient Data
- **Less than 5 reviews**: Return `null` for all insights
- **No decisions of one type**: Skip that domain in calculations
- **All decisions with same speed**: Only show available patterns

### Boundary Decisions
- **Exactly at threshold (50% regret)**: Classified as "medium" not "high"
- **One outlier surprise**: Still shows in pattern if consistent
- **Mixed confidence levels**: Reports as "variable" not "overconfident"

### Missing Data
- **No decision_speed**: Field is required, form validates
- **No decision_driver**: Optional, not used in current insights
- **No would_repeat**: Field is required in review

---

## Mathematical Properties

### Confidence Insight
- **Metric**: Percentage overconfident/underconfident
- **Threshold**: 40% (if > 40% of decisions have bias, pattern is meaningful)
- **Scale**: 0-100% confidence, compared to 5-point outcome scale

### Surprise Insight
- **Metric**: Average surprise score by domain
- **Scale**: 0-100 (0 = exactly expected, 100 = completely surprised)
- **Threshold**: 60 (scores > 60 indicate strong blind spot)

### Speed Insight
- **Metric**: Regret rate (% who wouldn't repeat)
- **Scale**: 0-100%
- **Threshold**: 50% (majority regret = meaningful pattern)
- **Minimum**: 3 decisions of that speed type

### Repeat Insight
- **Metric**: Satisfaction rate (% would repeat)
- **Scale**: 0-100%
- **Buckets**: 75%+ (good), 50-75% (mixed), 30-50% (learning), <30% (heavy learning)

---

## Future Extensions

### Phase 2: Emotional Patterns
Use `decision_driver` field to detect:
- "You make fear-driven decisions that you regret"
- "Logic-driven decisions have 85% satisfaction rate"
- "External pressure leads to rushed choices"

### Phase 3: Time-Based Patterns
- Confidence improvement over time
- Learning curves per domain
- Decision quality trends

### Phase 4: Comparative Insights
- vs. your baseline
- vs. decision types
- Sequential decision patterns

---

## Implementation Notes

**File**: `lib/analysis/patternAnalysis.ts`  
**Functions**:
- `analyzeConfidence()` — Detects overconfidence/underconfidence
- `analyzeSurprise()` — Finds blind spots by domain
- `analyzeSpeed()` — Detects regret patterns related to decision pace
- `analyzeRepeat()` — Calculates satisfaction metrics
- `generateInsights()` — Orchestrates all analysis

**Complexity**: O(n) where n = number of reviews (single pass through data)

**Performance**: <100ms for 100 reviews on modern hardware
