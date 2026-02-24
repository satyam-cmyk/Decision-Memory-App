/**
 * Decision Repository
 * 
 * Abstracts all Decision-related database operations.
 * This allows us to swap from IndexedDB to SQLite/MongoDB later
 * without changing the UI layer.
 */

import { db } from '@/lib/db/schema';
import { Decision, Review } from '@/lib/types';

export class DecisionRepository {
  /**
   * Create a new decision
   */
  async create(decision: Omit<Decision, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = new Date();
    const id = await db.decisions.add({
      ...decision,
      created_at: now,
      updated_at: now,
    });
    return String(id);
  }

  /**
   * Get a decision by ID
   */
  async getById(id: string): Promise<Decision | undefined> {
    return db.decisions.get(Number(id));
  }

  /**
   * Get all decisions sorted by creation date (newest first)
   */
  async getAll(): Promise<Decision[]> {
    return db.decisions.orderBy('created_at').reverse().toArray();
  }

  /**
   * Get decisions sorted by review date (for due queue)
   * Returns decisions where review_date <= today and no review exists yet
   * Uses index-aware queries for performance
   */
  async getDueForReview(): Promise<Decision[]> {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // Get all decisions with review_date <= today using index
    const dueDecisions = await db.decisions
      .where('review_date')
      .belowOrEqual(now)
      .toArray();

    // Get all reviewed decision IDs
    const reviewedDecisionIds = new Set(
      (await db.reviews.toArray()).map((r) => r.decision_id)
    );

    return dueDecisions
      .filter((d) => !reviewedDecisionIds.has(String(d.id!)))
      .sort((a, b) => new Date(a.review_date).getTime() - new Date(b.review_date).getTime());
  }

  /**
   * Get decisions by type
   */
  async getByType(type: string): Promise<Decision[]> {
    return db.decisions
      .where('decision_type')
      .equals(type)
      .reverse()
      .toArray();
  }

  /**
   * Update a decision
   */
  async update(id: string, updates: Partial<Decision>): Promise<void> {
    await db.decisions.update(id, {
      ...updates,
      updated_at: new Date(),
    });
  }

  /**
   * Delete a decision (also deletes associated reviews)
   */
  async delete(id: string): Promise<void> {
    await db.decisions.delete(id);
    await db.reviews.where('decision_id').equals(id).delete();
  }

  /**
   * Count total decisions
   */
  async count(): Promise<number> {
    return db.decisions.count();
  }

  /**
   * Get statistics for a decision
   * Returns whether it has been reviewed
   */
  async getWithReview(id: string): Promise<{ decision: Decision | undefined; review: Review | undefined }> {
    const decision = await this.getById(id);
    const review = decision ? await db.reviews.where('decision_id').equals(id).first() : undefined;
    return { decision, review };
  }
}

export const decisionRepository = new DecisionRepository();
