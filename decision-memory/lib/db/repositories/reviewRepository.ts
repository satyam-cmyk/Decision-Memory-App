/**
 * Review Repository
 * 
 * Abstracts all Review-related database operations.
 * Reviews represent the reflection/outcome phase of a decision.
 */

import { db } from '@/lib/db/schema';
import { Review } from '@/lib/types';

export class ReviewRepository {
  /**
   * Create a new review for a decision
   */
  async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = new Date();
    const id = await db.reviews.add({
      ...review,
      created_at: now,
      updated_at: now,
    });
    return String(id);
  }

  /**
   * Get a review by ID
   */
  async getById(id: string): Promise<Review | undefined> {
    return db.reviews.get(id);
  }

  /**
   * Get review for a specific decision
   */
  async getByDecisionId(decisionId: string): Promise<Review | undefined> {
    return db.reviews.where('decision_id').equals(decisionId).first();
  }

  /**
   * Get all reviews sorted by review date (newest first)
   */
  async getAll(): Promise<Review[]> {
    return db.reviews.orderBy('reviewed_at').reverse().toArray();
  }

  /**
   * Get reviews for multiple decisions
   */
  async getByDecisionIds(decisionIds: string[]): Promise<Review[]> {
    return db.reviews.where('decision_id').anyOf(decisionIds).toArray();
  }

  /**
   * Update a review
   */
  async update(id: string, updates: Partial<Review>): Promise<void> {
    await db.reviews.update(id, {
      ...updates,
      updated_at: new Date(),
    });
  }

  /**
   * Delete a review
   */
  async delete(id: string): Promise<void> {
    await db.reviews.delete(id);
  }

  /**
   * Count reviews
   */
  async count(): Promise<number> {
    return db.reviews.count();
  }

  /**
   * Get aggregated stats for reviews
   * 
   * New model statistics:
   * - Expectation Accuracy: How well did person predict outcomes?
   * - Decision Quality: Independent measure of thinking quality
   * - Calibration: Surprise levels when expectations matched reality
   */
  async getStats(): Promise<{
    total_reviews: number;
    very_thoughtful_count: number;
    reasonable_count: number;
    acceptable_count: number;
    rushed_count: number;
    emotional_count: number;
    much_better_count: number;
    slightly_better_count: number;
    as_expected_count: number;
    slightly_worse_count: number;
    much_worse_count: number;
    average_surprise_score: number;
    would_repeat_yes: number;
    would_repeat_unsure: number;
    would_repeat_no: number;
  }> {
    const reviews = await this.getAll();

    const stats = {
      total_reviews: reviews.length,
      // Decision Quality breakdown
      very_thoughtful_count: reviews.filter((r) => r.decision_quality === 'very_thoughtful').length,
      reasonable_count: reviews.filter((r) => r.decision_quality === 'reasonable').length,
      acceptable_count: reviews.filter((r) => r.decision_quality === 'acceptable').length,
      rushed_count: reviews.filter((r) => r.decision_quality === 'rushed').length,
      emotional_count: reviews.filter((r) => r.decision_quality === 'emotional').length,
      // Expectation Comparison breakdown
      much_better_count: reviews.filter((r) => r.expectation_comparison === 'much_better').length,
      slightly_better_count: reviews.filter((r) => r.expectation_comparison === 'slightly_better').length,
      as_expected_count: reviews.filter((r) => r.expectation_comparison === 'as_expected').length,
      slightly_worse_count: reviews.filter((r) => r.expectation_comparison === 'slightly_worse').length,
      much_worse_count: reviews.filter((r) => r.expectation_comparison === 'much_worse').length,
      // Surprise and Would Repeat
      average_surprise_score:
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.surprise_score, 0) / reviews.length : 0,
      would_repeat_yes: reviews.filter((r) => r.would_repeat === 'yes').length,
      would_repeat_unsure: reviews.filter((r) => r.would_repeat === 'unsure').length,
      would_repeat_no: reviews.filter((r) => r.would_repeat === 'no').length,
    };

    return stats;
  }
}

export const reviewRepository = new ReviewRepository();
