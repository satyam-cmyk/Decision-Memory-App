/**
 * Form validation utilities
 */

import { Decision, DecisionType, Importance, DecisionSpeed, DecisionDriver } from '@/lib/types';

export interface FormErrors {
  title?: string;
  reasoning?: string;
  confidence?: string;
  expected_outcome?: string;
  review_date?: string;
  decision_type?: string;
  importance?: string;
  decision_speed?: string;
  decision_driver?: string;
}

export interface FormData {
  title: string;
  reasoning: string;
  confidence: number;
  decision_type: DecisionType;
  importance: Importance;
  decision_speed: DecisionSpeed;
  decision_driver?: DecisionDriver;
  expected_outcome: string;
  review_date: string;
}

/**
 * Validate form data
 */
export function validateDecisionForm(data: Partial<FormData>): FormErrors {
  const errors: FormErrors = {};

  // Title
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'What decision did you make?';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  // Reasoning
  if (!data.reasoning || data.reasoning.trim().length === 0) {
    errors.reasoning = 'Why did you make this choice?';
  } else if (data.reasoning.length > 1000) {
    errors.reasoning = 'Reasoning must be 1000 characters or less';
  }

  // Confidence
  if (data.confidence === undefined || data.confidence === null) {
    errors.confidence = 'How confident are you? (0-100)';
  } else if (data.confidence < 0 || data.confidence > 100) {
    errors.confidence = 'Confidence must be between 0 and 100';
  } else if (!Number.isInteger(data.confidence)) {
    errors.confidence = 'Confidence must be a whole number';
  }

  // Expected outcome
  if (!data.expected_outcome || data.expected_outcome.trim().length === 0) {
    errors.expected_outcome = 'What do you expect to happen?';
  } else if (data.expected_outcome.length > 500) {
    errors.expected_outcome = 'Expected outcome must be 500 characters or less';
  }

  // Review date
  if (!data.review_date) {
    errors.review_date = 'When will you review this?';
  } else {
    const reviewDate = new Date(data.review_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(reviewDate.getTime())) {
      errors.review_date = 'Invalid date';
    } else if (reviewDate < today) {
      errors.review_date = 'Review date must be in the future';
    }
  }

  // Decision speed
  if (!data.decision_speed) {
    errors.decision_speed = 'How quickly did you make this decision?';
  }

  // Decision type (optional so no validation)
  // Importance (optional so no validation)

  return errors;
}

/**
 * Get minimum review date (today)
 */
export function getMinReviewDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get default review date (30 days from now)
 */
export function getDefaultReviewDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}
