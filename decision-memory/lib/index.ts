/**
 * Central exports for all database and repository functionality
 */

export { db } from '@/lib/db/schema';
export { decisionRepository } from '@/lib/db/repositories/decisionRepository';
export { reviewRepository } from '@/lib/db/repositories/reviewRepository';
export { initializeDatabase, clearDatabase, exportDatabase, importDatabase } from '@/lib/db/index';
export { generateInsights } from '@/lib/analysis/patternAnalysis';

export type { Decision, Review, Assumption, DecisionType, Importance, DecisionSpeed, DecisionDriver, ExpectationComparison, DecisionQuality, WouldRepeat } from '@/lib/types';
export type { LegacyInsights as Insights, InsightCard, InsightEvidence, InsightStrength } from '@/lib/analysis/patternAnalysis';
