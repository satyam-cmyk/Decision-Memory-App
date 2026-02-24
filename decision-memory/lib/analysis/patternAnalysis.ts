/**
 * Pattern Analysis Engine v2
 *
 * Deterministic, explainable insights with per-card strength,
 * conditional segments, and trend analytics.
 */

import type { Decision, Review, DecisionType, Importance, DecisionSpeed, DecisionDriver } from '@/lib/types';

// Outcome mapping: converts expectation_comparison to a numeric outcome score
const OUTCOME_SCORE_MAP: Record<string, number> = {
  much_worse: -2,
  slightly_worse: -1,
  as_expected: 0,
  slightly_better: 1,
  much_better: 2,
};

// Confidence bands and probability proxies
type ConfBand = 'low' | 'mid' | 'high' | 'very_high';
function confBand(conf: number): ConfBand {
  if (conf <= 39) return 'low';
  if (conf <= 59) return 'mid';
  if (conf <= 79) return 'high';
  return 'very_high';
}
function confProbFromBand(b: ConfBand): number {
  if (b === 'low') return 0.3;
  if (b === 'mid') return 0.5;
  if (b === 'high') return 0.7;
  return 0.9;
}

// Outcome probability proxy
function outcomeProbFromScore(score: number): number {
  if (score > 0) return 1;
  if (score === 0) return 0.5;
  return 0;
}

// Derived per-decision fields
export interface DerivedDecision {
  decision: Decision;
  review: Review;
  outcomeScore: number;
  confBand: ConfBand;
  confProb: number;
  outcomeProb: number;
  calibrationError: number;
  reviewedAt: Date;
}

// Card / Insight types
export type InsightStrength = 'weak' | 'medium' | 'strong';
export interface InsightEvidence {
  n: number;
  metric: string;
  value: number | string;
  baseline?: number | string;
  lift?: number; // relative lift vs baseline
}

export interface InsightCard {
  id: string;
  title: string;
  message: string;
  tags: string[];
  strength: InsightStrength;
  evidence: InsightEvidence[];
  actionHint?: string;
}

export interface Insights {
  cards: InsightCard[];
  baseline: {
    reviewCount: number;
    avgOutcomeScore: number;
    avgSurprise: number;
    avgCalibrationError: number;
  };
}

// Legacy UI insight shapes (kept for compatibility)
export interface ConfidenceInsight {
  emoji: string;
  message: string;
  averageConfidence: number;
  wellCalibratedCount: number;
  overconfidentCount: number;
  underconfidentCount: number;
}

export interface SurpriseInsight {
  emoji: string;
  message: string;
  averageSurpriseScore: number;
  mostSurprisedDomain?: string;
  leastSurprisedDomain?: string;
}

export interface SpeedInsight {
  emoji: string;
  message: string;
  quickDecisionsRegretRate: number;
  moderateDecisionsRegretRate: number;
  slowDecisionsRegretRate: number;
}

export interface RepeatInsight {
  emoji: string;
  message: string;
  repeatRate: number;
  wouldRepeatCount: number;
  wouldNotRepeatCount: number;
  unsureCount: number;
}

export interface LegacyInsights extends Insights {
  reviewCount: number;
  minimumReviewsNeeded: number;
  confidence?: ConfidenceInsight | null;
  surprise?: SurpriseInsight | null;
  speed?: SpeedInsight | null;
  repeat?: RepeatInsight | null;
}

// Per-insight minimum sample sizes for statistical validity (Layer 0)
const GATING_THRESHOLDS = {
  baselineCard: 3,        // Show calibration summary after 3 reviews
  segments: 8,            // Show segment cards after 8 reviews (and n >= 5 per segment)
  segmentMinSamples: 5,   // Require 5+ decisions in each segment
  trends: 12,             // Show trend cards after 12 reviews (needs 2 windows)
};

function round(n: number, digits = 2) {
  return Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
}

/**
 * Preprocess decisions+reviews into derived records.
 */
function derive(decisions: Decision[], reviews: Review[]): DerivedDecision[] {
  const reviewMap = new Map<string, Review>(reviews.map((r) => [r.decision_id, r]));

  const derived: DerivedDecision[] = [];

  for (const d of decisions) {
    const r = reviewMap.get(String(d.id));
    if (!r) continue;
    const outcomeScore = OUTCOME_SCORE_MAP[r.expectation_comparison] ?? 0;
    const band = confBand(d.confidence);
    const confProb = confProbFromBand(band);
    const outcomeProb = outcomeProbFromScore(outcomeScore);
    const calibrationError = Math.abs(confProb - outcomeProb);
    derived.push({
      decision: d,
      review: r,
      outcomeScore,
      confBand: band,
      confProb,
      outcomeProb,
      calibrationError,
      reviewedAt: new Date(r.reviewed_at),
    });
  }

  // sort by reviewedAt ascending
  derived.sort((a, b) => a.reviewedAt.getTime() - b.reviewedAt.getTime());
  return derived;
}

/**
 * Compute baselines for the entire reviewed population
 */
function computeBaselines(derived: DerivedDecision[]) {
  const n = derived.length;
  if (n === 0) return { reviewCount: 0, avgOutcomeScore: 0, avgSurprise: 0, avgCalibrationError: 0 };
  const avgOutcomeScore = derived.reduce((s, d) => s + d.outcomeScore, 0) / n;
  const avgSurprise = derived.reduce((s, d) => s + d.review.surprise_score, 0) / n;
  const avgCalibrationError = derived.reduce((s, d) => s + d.calibrationError, 0) / n;
  return { reviewCount: n, avgOutcomeScore: round(avgOutcomeScore), avgSurprise: round(avgSurprise), avgCalibrationError: round(avgCalibrationError) };
}

/**
 * Segment miner: generate candidate segments and evaluate lift vs baseline.
 */
function mineSegments(derived: DerivedDecision[], baseline: ReturnType<typeof computeBaselines>) {
  const segments: InsightCard[] = [];

  const decisionTypes: DecisionType[] = ['personal', 'work', 'finance', 'health', 'other'];
  const importances: Importance[] = ['low', 'medium', 'high'];
  const speeds: DecisionSpeed[] = ['quick', 'moderate', 'slow'];
  const confBands: ConfBand[] = ['low', 'mid', 'high', 'very_high'];

  // Candidate generation: keep combinations modest to avoid explosion
  for (const type of decisionTypes) {
    for (const imp of importances) {
      for (const spd of speeds) {
        for (const band of confBands) {
          const seg = derived.filter((d) => d.decision.decision_type === type && d.decision.importance === imp && d.decision.decision_speed === spd && d.confBand === band);
          if (seg.length === 0) continue;

          const n = seg.length;
          // metrics
          const avgOutcome = seg.reduce((s, x) => s + x.outcomeScore, 0) / n;
          const avgSurprise = seg.reduce((s, x) => s + x.review.surprise_score, 0) / n;
          const repeatRate = seg.reduce((s, x) => s + (x.review.would_repeat === 'yes' ? 1 : 0), 0) / n;
          const avgCalError = seg.reduce((s, x) => s + x.calibrationError, 0) / n;

          // compute lifts
          const outcomeLift = baseline.reviewCount ? avgOutcome - baseline.avgOutcomeScore : 0;
          const surpriseLift = baseline.reviewCount ? avgSurprise - baseline.avgSurprise : 0;
          const calErrorLift = baseline.reviewCount ? avgCalError - baseline.avgCalibrationError : 0;

          // require minimum samples for segments to be considered strong
          if (n < GATING_THRESHOLDS.segmentMinSamples) continue;

          // decide if this segment is interesting by simple heuristics
          const interesting = Math.abs(outcomeLift) >= 0.5 || Math.abs(surpriseLift) >= 12 || Math.abs(calErrorLift) >= 0.15 || (repeatRate < 0.5);
          if (!interesting) continue;

          // build card
          const title = `${type.charAt(0).toUpperCase() + type.slice(1)} • ${imp} • ${spd} • ${band}`;
          const message = `In ${n} ${type} decision${n>1?'s':''} (importance: ${imp}, speed: ${spd}), outcomes differ from your baseline.`;
          const tags = ['segment', type, imp, spd, band];

          // strength scoring
          let strength: InsightStrength = 'weak';
          const score = Math.abs(outcomeLift) * 2 + Math.abs(surpriseLift) / 10 + Math.abs(calErrorLift) * 3 + (n >= 6 ? 1 : 0);
          if (score > 3) strength = 'strong';
          else if (score > 1.2) strength = 'medium';

          const evidence: InsightEvidence[] = [
            { n, metric: 'avgOutcome', value: round(avgOutcome), baseline: baseline.avgOutcomeScore, lift: round(outcomeLift,2) },
            { n, metric: 'avgSurprise', value: round(avgSurprise), baseline: baseline.avgSurprise, lift: round(surpriseLift,2) },
            { n, metric: 'avgCalibrationError', value: round(avgCalError), baseline: baseline.avgCalibrationError, lift: round(calErrorLift,2) },
            { n, metric: 'repeatRate', value: round(repeatRate*100), baseline: undefined },
          ];

          segments.push({
            id: `seg-${type}-${imp}-${spd}-${band}`,
            title,
            message,
            tags,
            strength,
            evidence,
            actionHint: 'Notice the pattern and consider how you can test this in future decisions.',
          });
        }
      }
    }
  }

  // sort by strength and evidence lift
  segments.sort((a, b) => {
    const scoreA = a.evidence.reduce((s, e) => s + (typeof e.lift === 'number' ? Math.abs(e.lift) : 0), 0);
    const scoreB = b.evidence.reduce((s, e) => s + (typeof e.lift === 'number' ? Math.abs(e.lift) : 0), 0);
    return scoreB - scoreA;
  });

  return segments.slice(0, 6); // keep top 6
}

/**
 * Trend analyzer: compare last N vs previous N
 */
function analyzeTrends(derived: DerivedDecision[]) {
  const n = derived.length;
  const window = 10; // window for comparing recent vs historical
  if (n < 2) return [];
  const lastN = Math.min(window, Math.floor(n / 2));
  if (lastN < 1) return [];

  const tail = derived.slice(-lastN);
  const prev = derived.slice(-lastN*2, -lastN);
  if (prev.length === 0) return [];

  const avg = (arr: DerivedDecision[], fn: (d: DerivedDecision) => number) => arr.reduce((s, x) => s + fn(x), 0) / arr.length;

  const trend = [] as InsightCard[];
  const outcomeDelta = round(avg(tail, d => d.outcomeScore) - avg(prev, d => d.outcomeScore));
  const surpriseDelta = round(avg(tail, d => d.review.surprise_score) - avg(prev, d => d.review.surprise_score));
  const calErrorDelta = round(avg(tail, d => d.calibrationError) - avg(prev, d => d.calibrationError));

  if (Math.abs(outcomeDelta) >= 0.5) {
    trend.push({
      id: 'trend-outcome',
      title: 'Outcome Trend',
      message: `Your average outcome score changed by ${outcomeDelta} (last ${lastN} vs previous ${lastN}).`,
      tags: ['trend','outcome'],
      strength: Math.abs(outcomeDelta) > 1 ? 'strong' : 'medium',
      evidence: [ { n: lastN, metric: 'outcomeDelta', value: outcomeDelta } ],
      actionHint: 'Watch whether this persists over the next window.'
    });
  }

  if (Math.abs(surpriseDelta) >= 8) {
    trend.push({
      id: 'trend-surprise',
      title: 'Surprise Trend',
      message: `Your surprise score changed by ${surpriseDelta} points (last ${lastN} vs previous ${lastN}).`,
      tags: ['trend','surprise'],
      strength: Math.abs(surpriseDelta) > 15 ? 'strong' : 'medium',
      evidence: [ { n: lastN, metric: 'surpriseDelta', value: surpriseDelta } ],
      actionHint: 'This suggests your mental model is shifting.'
    });
  }

  if (Math.abs(calErrorDelta) >= 0.05) {
    trend.push({
      id: 'trend-calibration',
      title: 'Calibration Trend',
      message: `Your calibration error changed by ${calErrorDelta} (last ${lastN} vs previous ${lastN}).`,
      tags: ['trend','calibration'],
      strength: Math.abs(calErrorDelta) > 0.12 ? 'strong' : 'medium',
      evidence: [ { n: lastN, metric: 'calErrorDelta', value: calErrorDelta } ],
      actionHint: 'If this improves, you are getting better at predicting outcomes.'
    });
  }

  return trend;
}

/**
 * Generate insights v2
 */
export async function generateInsights(decisions: Decision[], reviews: Review[]): Promise<LegacyInsights> {
  const derived = derive(decisions, reviews);
  const baseline = computeBaselines(derived);

  // Cards: segments + trends + top-level calibration summary (gated by reviewCount)
  const cards: InsightCard[] = [];
  
  const reviewCount = derived.length;

  // Gate 1: Show baseline calibration card after 3+ reviews
  if (reviewCount >= GATING_THRESHOLDS.baselineCard && derived.length > 0) {
    const medianConfidence = (() => {
      const arr = derived.map(d => d.decision.confidence).sort((a,b)=>a-b);
      const m = Math.floor(arr.length/2);
      return arr.length % 2 === 1 ? arr[m] : Math.round((arr[m-1]+arr[m])/2);
    })();

    const iqr = (() => {
      const arr = derived.map(d => d.decision.confidence).sort((a,b)=>a-b);
      const q1 = arr[Math.floor((arr.length - 1) * 0.25)];
      const q3 = arr[Math.floor((arr.length - 1) * 0.75)];
      return q3 - q1;
    })();

    const avgCalibrationError = baseline.avgCalibrationError;
    const confCard: InsightCard = {
      id: 'calibration-summary',
      title: 'Confidence Calibration',
      message: `Median confidence ${medianConfidence}%. Avg calibration error ${avgCalibrationError}.`,
      tags: ['calibration'],
      strength: derived.length >= 8 ? 'strong' : 'medium',
      evidence: [ { n: derived.length, metric: 'medianConfidence', value: medianConfidence }, { n: derived.length, metric: 'iqr', value: iqr }, { n: derived.length, metric: 'avgCalibrationError', value: avgCalibrationError } ],
      actionHint: 'Observe which contexts show higher calibration error.'
    };
    cards.push(confCard);
  }

  // Gate 2: Segment miner (show after 8+ reviews)
  if (reviewCount >= GATING_THRESHOLDS.segments) {
    const segments = mineSegments(derived, baseline);
    cards.push(...segments);
  }

  // Gate 3: Trend analyzer (show after 12+ reviews)
  if (reviewCount >= GATING_THRESHOLDS.trends) {
    const trends = analyzeTrends(derived);
    cards.push(...trends);
  }

  // Build legacy shaped insights for UI compatibility
  // These are shown once baseline threshold is met (3+ reviews)
  const minimumReviewsNeeded = GATING_THRESHOLDS.baselineCard;

  // Confidence insight (show after 3+ reviews)
  let confidence: ConfidenceInsight | null = null;
  if (reviewCount >= minimumReviewsNeeded) {
    const avgConf = Math.round(derived.reduce((s, d) => s + d.decision.confidence, 0) / reviewCount);
    let well = 0, over = 0, under = 0;
    for (const d of derived) {
      const bandP = d.confProb;
      const outP = d.outcomeProb;
      if (Math.abs(bandP - outP) <= 0.15) well++;
      else if (bandP > outP) over++;
      else under++;
    }
    confidence = { emoji: '🎯', message: 'How your confidence matches reality', averageConfidence: avgConf, wellCalibratedCount: well, overconfidentCount: over, underconfidentCount: under };
  }

  // Surprise insight (show after 3+ reviews)
  let surprise: SurpriseInsight | null = null;
  if (reviewCount >= minimumReviewsNeeded) {
    const avgSurprise = round(derived.reduce((s, d) => s + d.review.surprise_score, 0) / reviewCount);
    // simple domain most/least surprised
    const domainMap = new Map<string, { n: number; tot: number }>();
    for (const d of derived) {
      const k = d.decision.decision_type;
      const cur = domainMap.get(k) ?? { n: 0, tot: 0 };
      cur.n += 1;
      cur.tot += d.review.surprise_score;
      domainMap.set(k, cur);
    }
    let most: string | undefined; let least: string | undefined; let mostVal = -Infinity; let leastVal = Infinity;
    for (const [k, v] of domainMap.entries()) {
      const av = v.tot / v.n;
      if (av > mostVal) { mostVal = av; most = k; }
      if (av < leastVal) { leastVal = av; least = k; }
    }
    surprise = { emoji: '😲', message: 'Where outcomes surprised you', averageSurpriseScore: avgSurprise, mostSurprisedDomain: most, leastSurprisedDomain: least };
  }

  // Speed insight (show after 3+ reviews)
  let speed: SpeedInsight | null = null;
  if (reviewCount >= minimumReviewsNeeded) {
    const buckets: Record<string, { n: number; regret: number }> = { quick: { n:0, regret:0 }, moderate: { n:0, regret:0 }, slow: { n:0, regret:0 } };
    for (const d of derived) {
      const s = d.decision.decision_speed;
      const b = buckets[s] ?? { n:0, regret:0 };
      b.n++;
      if (d.review.would_repeat === 'no') b.regret++;
      buckets[s] = b;
    }
    const q = buckets.quick.n ? Math.round((buckets.quick.regret / buckets.quick.n) * 100) : 0;
    const m = buckets.moderate.n ? Math.round((buckets.moderate.regret / buckets.moderate.n) * 100) : 0;
    const srate = buckets.slow.n ? Math.round((buckets.slow.regret / buckets.slow.n) * 100) : 0;
    speed = { emoji: '🏃', message: 'Speed vs regret patterns', quickDecisionsRegretRate: q, moderateDecisionsRegretRate: m, slowDecisionsRegretRate: srate };
  }

  // Repeat insight (show after 3+ reviews)
  let repeat: RepeatInsight | null = null;
  if (reviewCount >= minimumReviewsNeeded) {
    let would = 0, wouldNot = 0, unsure = 0;
    for (const d of derived) {
      if (d.review.would_repeat === 'yes') would++;
      else if (d.review.would_repeat === 'no') wouldNot++;
      else unsure++;
    }
    const rate = Math.round((would / reviewCount) * 100);
    repeat = { emoji: '🔁', message: 'How often you would repeat decisions', repeatRate: rate, wouldRepeatCount: would, wouldNotRepeatCount: wouldNot, unsureCount: unsure };
  }

  return {
    cards,
    baseline,
    // legacy
    reviewCount,
    minimumReviewsNeeded,
    confidence,
    surprise,
    speed,
    repeat,
  } as LegacyInsights;
}
