import { Decision, Review, Importance } from '@/lib/types';

// Basic numeric mapping helpers
const expectationToNumeric = (e: string) => {
  switch (e) {
    case 'much_better':
      return 2;
    case 'slightly_better':
      return 1;
    case 'as_expected':
      return 0;
    case 'slightly_worse':
      return -1;
    case 'much_worse':
      return -2;
    default:
      return 0;
  }
};

const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const variance = (arr: number[]) => {
  if (!arr.length) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length;
};
const std = (arr: number[]) => Math.sqrt(variance(arr));

/**
 * Brier score: mean squared error between predicted probability and actual outcome (0/1)
 */
export function brierScore(predicted: number[], actual: number[]) {
  if (predicted.length === 0 || predicted.length !== actual.length) return 0;
  const n = predicted.length;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const p = Math.max(0, Math.min(1, predicted[i]));
    const a = actual[i] ? 1 : 0;
    s += (p - a) * (p - a);
  }
  return s / n;
}

/**
 * Calibration error using decision confidence as a probability proxy.
 * outcomeBinary is derived: any 'better' or 'as_expected' considered success (1), worse considered 0.
 */
export function calibrationErrorFromConfidence(decisions: Decision[], reviews: Review[]) {
  const paired: number[] = [];
  const outcomes: number[] = [];
  const reviewByDecision = new Map(reviews.map((r) => [r.decision_id, r]));
  for (const d of decisions) {
    const r = reviewByDecision.get(String(d.id));
    if (!r) continue;
    const p = (d.confidence ?? 50) / 100;
    const outcome = ['much_better', 'slightly_better', 'as_expected'].includes(r.expectation_comparison) ? 1 : 0;
    paired.push(p);
    outcomes.push(outcome);
  }
  if (!paired.length) return 0;
  // mean absolute error
  const errors = paired.map((p, i) => Math.abs(p - outcomes[i]));
  return mean(errors);
}

/** Surprise volatility: standard deviation of surprise_score */
export function surpriseVolatility(reviews: Review[]) {
  const arr = reviews.map((r) => r.surprise_score ?? 0);
  return std(arr);
}

/**
 * Regret rate by importance: percent of reviews with would_repeat === 'no' grouped by importance
 */
export function regretRateByImportance(decisions: Decision[], reviews: Review[]) {
  const map = new Map<string, { no: number; total: number }>();
  const reviewByDecision = new Map(reviews.map((r) => [r.decision_id, r]));
  for (const d of decisions) {
    const r = reviewByDecision.get(String(d.id));
    const key = d.importance ?? 'medium';
    if (!map.has(key)) map.set(key, { no: 0, total: 0 });
    const o = map.get(key)!;
    if (r) {
      o.total += 1;
      if (r.would_repeat === 'no') o.no += 1;
    }
  }
  const result: Record<string, number> = {};
  for (const [k, v] of map) {
    result[k] = v.total ? Math.round((v.no / v.total) * 100) : 0;
  }
  return result as Record<Importance | string, number>;
}

/** Map decision speed to average outcome numeric */
export function decisionSpeedOutcomeStats(decisions: Decision[], reviews: Review[]) {
  const groups = new Map<string, number[]>();
  const reviewByDecision = new Map(reviews.map((r) => [r.decision_id, r]));
  for (const d of decisions) {
    const speed = d.decision_speed ?? 'moderate';
    const r = reviewByDecision.get(String(d.id));
    const val = r ? expectationToNumeric(r.expectation_comparison) : NaN;
    if (!groups.has(speed)) groups.set(speed, []);
    if (!isNaN(val)) groups.get(speed)!.push(val);
  }
  const out: Record<string, { avgOutcome: number; count: number }> = {};
  for (const [k, arr] of groups) {
    out[k] = { avgOutcome: mean(arr), count: arr.length };
  }
  return out;
}

/**
 * Time-to-review correlation: Pearson correlation between days-to-review and surprise_score
 */
export function timeToReviewCorrelation(decisions: Decision[], reviews: Review[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  const reviewByDecision = new Map(reviews.map((r) => [r.decision_id, r]));
  for (const d of decisions) {
    const r = reviewByDecision.get(String(d.id));
    if (!r) continue;
    const created = new Date(d.created_at).getTime();
    const reviewed = new Date(r.reviewed_at).getTime();
    const days = (reviewed - created) / (1000 * 60 * 60 * 24);
    xs.push(days);
    ys.push(r.surprise_score ?? 0);
  }
  if (!xs.length) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  const num = xs.reduce((s, xi, i) => s + (xi - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(xs.reduce((s, xi) => s + (xi - mx) * (xi - mx), 0) * ys.reduce((s, yi) => s + (yi - my) * (yi - my), 0));
  return den === 0 ? 0 : num / den;
}

/**
 * Cohort improvement: compare mean outcome score in recent window vs prior window (in days)
 */
export function cohortImprovement(decisions: Decision[], reviews: Review[], filter: (d: Decision) => boolean, windowDays = 90) {
  const now = Date.now();
  const recentCut = now - windowDays * 24 * 60 * 60 * 1000;
  const reviewByDecision = new Map(reviews.map((r) => [r.decision_id, r]));
  const recent: number[] = [];
  const prior: number[] = [];
  for (const d of decisions.filter(filter)) {
    const r = reviewByDecision.get(String(d.id));
    if (!r) continue;
    const reviewedAt = new Date(r.reviewed_at).getTime();
    const score = expectationToNumeric(r.expectation_comparison);
    if (reviewedAt >= recentCut) recent.push(score);
    else prior.push(score);
  }
  return { recentAvg: mean(recent), priorAvg: mean(prior), delta: mean(recent) - mean(prior) };
}

/**
 * Consistency score: normalized inverse of surprise volatility (0-100)
 */
export function consistencyScore(reviews: Review[]) {
  const s = surpriseVolatility(reviews);
  // assume surprise range roughly 0-100, normalize
  const score = 1 - Math.min(1, s / 50); // 0 => high volatility, 1 => low
  return Math.round(score * 100);
}

/**
 * Risk-adjusted repeat rate: weight 'yes' answers by importance and downweight by surprise
 */
export function riskAdjustedRepeatRate(decisions: Decision[], reviews: Review[]) {
  const reviewByDecision = new Map(reviews.map((r) => [r.decision_id, r]));
  let weightedYes = 0;
  let totalWeight = 0;
  const importanceWeight = (imp?: Importance) => (imp === 'high' ? 3 : imp === 'medium' ? 2 : 1);
  for (const d of decisions) {
    const r = reviewByDecision.get(String(d.id));
    if (!r) continue;
    const w = importanceWeight(d.importance);
    totalWeight += w;
    const surprisePenalty = 1 - ((r.surprise_score ?? 0) / 100);
    if (r.would_repeat === 'yes') weightedYes += w * surprisePenalty;
  }
  return totalWeight ? Math.round((weightedYes / totalWeight) * 100) : 0;
}

/**
 * Outcome ROI: average numeric mapping of expectation comparison for a cohort
 */
export function outcomeROI(reviews: Review[]) {
  const arr = reviews.map((r) => expectationToNumeric(r.expectation_comparison));
  return mean(arr);
}

export default {
  brierScore,
  calibrationErrorFromConfidence,
  surpriseVolatility,
  regretRateByImportance,
  decisionSpeedOutcomeStats,
  timeToReviewCorrelation,
  cohortImprovement,
  consistencyScore,
  riskAdjustedRepeatRate,
  outcomeROI,
};
