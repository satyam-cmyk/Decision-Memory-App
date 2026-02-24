/**
 * Core types for Decision Memory
 * Focused on decision quality and calibration, not binary outcomes
 */

export type DecisionType = 'personal' | 'work' | 'finance' | 'health' | 'other';
export type Importance = 'low' | 'medium' | 'high';

/**
 * How quickly was the decision made relative to its importance?
 * Critical for detecting patterns like "I rush important decisions"
 */
export type DecisionSpeed = 'quick' | 'moderate' | 'slow';

/**
 * What primarily influenced the decision?
 * Reveals emotional vs logical patterns
 */
export type DecisionDriver = 'logic' | 'urgency' | 'fear' | 'opportunity' | 'external_pressure';

/**
 * Reality vs Expectation comparison
 * How did actual outcome compare to what was expected?
 */
export type ExpectationComparison = 
  | 'much_better'      // Much better than expected
  | 'slightly_better'  // Slightly better
  | 'as_expected'      // About as expected
  | 'slightly_worse'   // Slightly worse
  | 'much_worse';      // Much worse than expected

/**
 * Decision Process Quality
 * How sound was the thinking at the time of decision?
 * (Independent of the outcome)
 */
export type DecisionQuality = 
  | 'very_thoughtful'  // Very thoughtful and informed
  | 'reasonable'       // Reasonable
  | 'acceptable'       // Acceptable
  | 'rushed'           // Rushed
  | 'emotional';       // Emotional / reactive

/**
 * Would Repeat Decision
 * Given the outcome and learning, would you make the same choice again?
 */
export type WouldRepeat = 'yes' | 'no' | 'unsure' | null;

/**
 * Decision: Represents the moment a choice is made
 */
export interface Decision {
  id?: string;
  title: string;
  reasoning: string;
  confidence: number; // 0-100 at time of decision
  decision_type: DecisionType;
  importance: Importance;
  decision_speed: DecisionSpeed; // How quickly was this decided?
  decision_driver?: DecisionDriver; // What influenced this decision most?
  expected_outcome: string;
  review_date: Date;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Review: Represents reflection after outcome
 * Based on behavioral decision science principles
 */
export interface Review {
  id?: string;
  decision_id: string;
  
  // Primary learning signal: gap between expectation and reality
  expectation_comparison: ExpectationComparison;
  
  // Decision quality: was the thinking sound at the time?
  decision_quality: DecisionQuality;
  
  // How different from mental model (0=exactly as expected, 100=completely surprised)
  surprise_score: number;
  
  // What actually happened (context for the review)
  what_happened: string;
  
  // The main learning reflection
  learning_note: string;
  
  // Would you make the same decision again?
  would_repeat: WouldRepeat;
  
  // Metadata
  reviewed_at: Date;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Assumption: Tracks what the decision was based on (Phase 1+)
 */
export interface Assumption {
  id?: string;
  decision_id: string;
  assumption_text: string;
  confidence: number;
  created_at: Date;
}
