/**
 * React hooks for database operations
 * These can be used in client components for easy database access
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { decisionRepository, reviewRepository } from '@/lib';
import type { Decision, Review } from '@/lib';

/**
 * Hook to fetch all decisions
 */
export function useDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await decisionRepository.getAll();
      setDecisions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch decisions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { decisions, loading, error, refresh };
}

/**
 * Hook to fetch decisions due for review
 */
export function useDueDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await decisionRepository.getDueForReview();
      setDecisions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch due decisions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { decisions, loading, error, refresh };
}

/**
 * Hook to fetch a single decision with its review
 */
export function useDecisionWithReview(decisionId: string) {
  const [decision, setDecision] = useState<Decision | undefined>(undefined);
  const [review, setReview] = useState<Review | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await decisionRepository.getWithReview(decisionId);
      setDecision(result.decision);
      setReview(result.review);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch decision'));
    } finally {
      setLoading(false);
    }
  }, [decisionId]);

  useEffect(() => {
    refresh();
  }, [refresh, decisionId]);

  return { decision, review, loading, error, refresh };
}

/**
 * Hook to fetch review statistics
 */
export function useReviewStats() {
  const [stats, setStats] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewRepository.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
