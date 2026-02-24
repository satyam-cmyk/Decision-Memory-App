# Decision Memory App — Strategic Alignment Checklist

**Purpose**: Ensure the app stays disciplined as a **personal decision calibration system**, not a journal or productivity tracker.

**Updated**: February 18, 2026

---

## ✅ Core Strategic Intent

- [x] NOT a tracker
- [x] NOT a diary
- [x] NOT a reflection tool
- [x] NOT a productivity app
- [x] **IS a system that helps users understand how they think, where they misjudge, and how their mental models evolve**

---

## ✅ Behavioral Intelligence Layer (5 Core Dimensions)

### 3.1 Confidence Calibration (MOST IMPORTANT)
- [x] **Implemented**: Captures confidence at decision time (0-100 slider)
- [x] **Implemented**: Captures expectation vs reality in review (ExpectationComparison type)
- [ ] **NOT BUILT**: Insight card showing "You are usually highly confident"
- [ ] **NOT BUILT**: Pattern detection showing "High-confidence decisions often don't match reality"
- [ ] **NOT BUILT**: Alert pattern like "You tend to underestimate uncertainty"

**Status**: Data layer ready. Insights layer missing.

---

### 3.2 Surprise Patterns (Blind Spot Detector)
- [x] **Implemented**: Captures surprise_score (0-100 scale)
- [x] **Implemented**: Form includes explicit surprise field in review
- [ ] **NOT BUILT**: Insight card showing "You're frequently surprised by personal decisions"
- [ ] **NOT BUILT**: Domain-level surprise analysis (e.g., "Work decisions create less surprise")
- [ ] **NOT BUILT**: Surprise-by-type dashboard

**Status**: Data layer ready. Insights layer missing.

---

### 3.3 Repeat Decision Signal (Regret Map)
- [x] **Implemented**: Captures would_repeat field (yes/no/unsure)
- [ ] **NOT BUILT**: Insight card showing "You wouldn't repeat many high-importance decisions"
- [ ] **NOT BUILT**: Pattern like "You're satisfied with fast decisions, but not with delayed ones"
- [ ] **NOT BUILT**: Repeat rate percentage dashboard

**Status**: Data layer ready. Insights layer missing.

---

### 3.4 Decision Type Patterns
- [x] **Implemented**: Captures decision_type (personal, work, finance, health, other)
- [ ] **NOT BUILT**: Insight card showing "You're more accurate in work decisions"
- [ ] **NOT BUILT**: Domain-specific accuracy reporting
- [ ] **NOT BUILT**: Type-filtered timeline or comparison view

**Status**: Data structure ready. Analytics missing.

---

### 3.5 Expectation Accuracy
- [x] **Implemented**: Captures expectation_comparison (much_better, slightly_better, as_expected, slightly_worse, much_worse)
- [ ] **NOT BUILT**: Insight card showing "Outcomes are often worse than you predict"
- [ ] **NOT BUILT**: Optimism bias detection
- [ ] **NOT BUILT**: Prediction calibration chart

**Status**: Data layer ready. Insights layer missing.

---

## 🚨 High-Impact, Low-Complexity Fields (MISSING)

These two fields are critical for behavioral pattern detection but NOT yet in the schema:

### 7.1 Decision Speed (MUST ADD)
- [ ] Quick
- [ ] Moderate  
- [ ] Slow

**Why**: Enables insights like "Quick decisions are often regretted" or "Fast decisions have lower surprise scores"

**Priority**: **HIGH** — Add to Decision capture form and schema immediately

---

### 7.2 Decision Driver (MUST ADD)
- [ ] Logic
- [ ] Urgency
- [ ] Fear
- [ ] Opportunity
- [ ] External pressure

**Why**: Reveals emotional patterns. "Logic-driven decisions have higher accuracy" vs "Fear-driven decisions are most regretted"

**Priority**: **HIGH** — Add to Decision capture form and schema immediately

---

## ✅ The 3 Insight Cards (MVP, NOT YET BUILT)

These three cards would make the app feel intelligent. They should appear on dashboard:

### Card 1 — Confidence Reality Gap
```
"Your confidence tends to be higher than reality."
(Compare avg confidence at decision time vs expectation_comparison outcomes)
```
- [ ] NOT BUILT

### Card 2 — Surprise Zone
```
"You're most surprised by personal decisions."
(Show which decision_type has highest surprise_score)
```
- [ ] NOT BUILT

### Card 3 — Repeat Rate
```
"You would repeat 60% of your decisions."
(Calculate percentage of would_repeat = yes)
```
- [ ] NOT BUILT

---

## ✅ Design Principles (ENFORCED)

The app must NEVER imply:
- [x] ❌ Good outcome = good decision
- [x] ❌ Bad outcome = bad decision

Instead, it must highlight:
- [x] ✅ Thinking quality (decision_quality field: thoughtful vs rushed)
- [x] ✅ Prediction accuracy (expectation_comparison vs confidence)
- [x] ✅ Pattern repetition (would_repeat signal)

**Status**: Form messaging already aligned. Code comments reflect this.

---

## 🔍 Feature Completeness Matrix

| Feature | Data Capture | Data Storage | Insights/Analytics | Status |
|---------|--------------|--------------|-------------------|--------|
| Confidence calibration | ✅ | ✅ | ❌ | In progress |
| Surprise patterns | ✅ | ✅ | ❌ | In progress |
| Repeat decision signal | ✅ | ✅ | ❌ | In progress |
| Decision type patterns | ✅ | ✅ | ❌ | In progress |
| Expectation accuracy | ✅ | ✅ | ❌ | In progress |
| Decision speed | ❌ | ❌ | ❌ | **NOT STARTED** |
| Decision driver | ❌ | ❌ | ❌ | **NOT STARTED** |
| Insight cards (3x) | N/A | N/A | ❌ | **NOT STARTED** |

---

## 📋 Current Implementation Status

### Fully Aligned ✅
- [x] Decision capture form (title, reasoning, confidence, type, importance, expected_outcome, review_date)
- [x] Review form (expectation_comparison, decision_quality, surprise_score, what_happened, learning_note, would_repeat)
- [x] Database schema supports all core behavioral signals
- [x] Timeline view shows all decisions
- [x] Due queue shows decisions needing review
- [x] Type system is disciplined (no outcome tracking, no binary success/failure)

### Missing — High Priority ⚠️
- [ ] Decision speed field (+ form, + schema)
- [ ] Decision driver field (+ form, + schema)
- [ ] Insight cards calculation logic
- [ ] Analytics view/page
- [ ] Pattern detection algorithms
- [ ] Behavioral intelligence dashboard

### Missing — Future 🔮
- [ ] Confidence calibration visualization
- [ ] Surprise zone heatmap
- [ ] Decision type accuracy comparison
- [ ] Advanced filtering and segmentation
- [ ] Export/reflection features
- [ ] Decision assumptions tracking (Assumption table waiting to be used)

---

## 🎯 The Core Loop (Already Supported)

```
Decision → Prediction → Outcome → Reflection → Pattern → Better Next Decision
```

✅ **Data structures support it**  
❌ **Intelligence layer not yet built**

---

## 📌 Next Immediate Actions (Priority Order)

1. **Add decision_speed field to schema and both forms** (quick wins)
2. **Add decision_driver field to schema and both forms** (quick wins)
3. **Build the 3 insight cards** (calculate and display on dashboard)
4. **Create analytics page** (show confidence calibration, surprise patterns, repeat rates)
5. **Add decision-type filtering** to timeline
6. **Build pattern detection algorithm** (confidence gap, surprise zone)

---

## ✅ Strategic Validation Passed

**Core positioning**: ✅ CORRECT  
**Data model**: ✅ DISCIPLINED  
**Form messaging**: ✅ ALIGNED  
**Missing**: Behavioral intelligence layer (insights, analytics, patterns)

The app has the **foundation** of a decision calibration system. It now needs the **intelligence layer** to show users:
- Where they misjudge
- What patterns repeat
- How their thinking evolves

That's the aha moment.
