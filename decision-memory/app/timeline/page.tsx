'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { decisionRepository, reviewRepository } from '@/lib';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Decision, Review } from '@/lib';

interface DecisionWithReview extends Decision {
  review?: Review;
}

export default function TimelinePage() {
  const [decisions, setDecisions] = useState<DecisionWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    calibration_score: 0,
    good_thinking_despite_bad_outcomes: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const allDecisions = await decisionRepository.getAll();
        const decisionsWithReviews = await Promise.all(
          allDecisions.map(async (dec) => ({
            ...dec,
            review: await reviewRepository.getByDecisionId(String(dec.id)),
          }))
        );

        // Calculate new metrics
        const reviewed = decisionsWithReviews.filter((d) => d.review).length;
        
        // Calibration: measure how accurate surprise predictions were
        // Lower surprise on expected outcomes = good calibration
        const surpriseScores = decisionsWithReviews
          .filter((d) => d.review && d.review.expectation_comparison === 'as_expected')
          .map((d) => d.review?.surprise_score || 0);
        const avgSurpriseWhenAccurate = surpriseScores.length > 0 
          ? 100 - (surpriseScores.reduce((a, b) => a + b, 0) / surpriseScores.length)
          : 0;

        // Good thinking despite bad outcomes: count instances where decision_quality is high
        // but expectation_comparison shows worse outcome
        const thoughtfulDespiteBadOutcome = decisionsWithReviews.filter((d) => 
          d.review && 
          (d.review.decision_quality === 'very_thoughtful' || d.review.decision_quality === 'reasonable') &&
          (d.review.expectation_comparison === 'slightly_worse' || d.review.expectation_comparison === 'much_worse')
        ).length;

        setDecisions(decisionsWithReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setStats({
          total: allDecisions.length,
          reviewed,
          calibration_score: Math.round(avgSurpriseWhenAccurate),
          good_thinking_despite_bad_outcomes: thoughtfulDespiteBadOutcome,
        });
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600">⏳ Loading timeline...</p>
      </div>
    );
  }

  // Getters for badge styles
  const getExpectationBadge = (comparison: string) => {
    const badges: Record<string, { bg: string; text: string; emoji: string }> = {
      much_better: { bg: 'bg-green-100', text: 'text-green-800', emoji: '⬆️' },
      slightly_better: { bg: 'bg-emerald-100', text: 'text-emerald-800', emoji: '↗️' },
      as_expected: { bg: 'bg-blue-100', text: 'text-blue-800', emoji: '➡️' },
      slightly_worse: { bg: 'bg-orange-100', text: 'text-orange-800', emoji: '↘️' },
      much_worse: { bg: 'bg-red-100', text: 'text-red-800', emoji: '⬇️' },
    };
    return badges[comparison] || badges.as_expected;
  };

  const getQualityBadge = (quality: string) => {
    const badges: Record<string, { bg: string; text: string; emoji: string }> = {
      very_thoughtful: { bg: 'bg-indigo-100', text: 'text-indigo-800', emoji: '🧠' },
      reasonable: { bg: 'bg-blue-100', text: 'text-blue-800', emoji: '✓' },
      acceptable: { bg: 'bg-gray-100', text: 'text-gray-800', emoji: '⚡' },
      rushed: { bg: 'bg-yellow-100', text: 'text-yellow-800', emoji: '⏱️' },
      emotional: { bg: 'bg-red-100', text: 'text-red-800', emoji: '🔥' },
    };
    return badges[quality] || badges.acceptable;
  };

  const expectationLabels: Record<string, string> = {
    much_better: 'Much better than expected',
    slightly_better: 'Slightly better than expected',
    as_expected: 'About as expected',
    slightly_worse: 'Slightly worse than expected',
    much_worse: 'Much worse than expected',
  };

  const qualityLabels: Record<string, string> = {
    very_thoughtful: 'Very thoughtful & informed',
    reasonable: 'Reasonable',
    acceptable: 'Acceptable',
    rushed: 'Rushed',
    emotional: 'Emotional / reactive',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">📚 Timeline</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors">
              Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Your Decision Timeline</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Learn how you think by examining decision outcomes and your reasoning quality.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-12">
          <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-900/50">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-300 mt-1">Total Decisions</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-amber-100 dark:to-amber-900/10 rounded-lg p-6 border border-amber-200 dark:border-amber-900/50">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 dark:text-amber-400">{stats.reviewed}</div>
            <div className="text-sm font-medium text-amber-600 dark:text-amber-300 mt-1">Reviewed</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-indigo-100 dark:to-indigo-900/10 rounded-lg p-6 border border-indigo-200 dark:border-indigo-900/50">
            <div className="text-3xl md:text-4xl font-bold text-indigo-700 dark:text-indigo-400">{stats.calibration_score}%</div>
            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mt-1">Calibration</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-emerald-100 dark:to-emerald-900/10 rounded-lg p-6 border border-emerald-200 dark:border-emerald-900/50">
            <div className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-400">{stats.good_thinking_despite_bad_outcomes}</div>
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-300 mt-1">Sound decisions</div>
          </div>
        </div>

      {/* Decision Cards */}
      {decisions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">You haven&apos;t logged any decisions yet.</p>
          <Link href="/capture" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
            Start logging decisions →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {decisions.map((decision) => (
            <div key={decision.id} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-lg transition-all">
              {/* Decision Header */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{decision.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(decision.created_at).toLocaleDateString()}</p>
                  </div>
                  {decision.review && (
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 whitespace-nowrap">✓ Reviewed</div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{decision.reasoning}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Expected:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{decision.expected_outcome}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Confidence:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{decision.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Review Section (if reviewed) */}
              {decision.review && (
                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 space-y-5">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">📊 How it unfolded</h4>

                    {/* Expectation Comparison */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reality vs Expectation:</p>
                      <div className={`px-3 py-2 rounded-lg ${getExpectationBadge(decision.review.expectation_comparison).bg} ${getExpectationBadge(decision.review.expectation_comparison).text} text-sm font-medium inline-block`}>
                        {getExpectationBadge(decision.review.expectation_comparison).emoji} {expectationLabels[decision.review.expectation_comparison]}
                      </div>
                    </div>

                    {/* Decision Quality */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quality of Your Thinking:</p>
                      <div className={`px-3 py-2 rounded-lg ${getQualityBadge(decision.review.decision_quality).bg} ${getQualityBadge(decision.review.decision_quality).text} text-sm font-medium inline-block`}>
                        {getQualityBadge(decision.review.decision_quality).emoji} {qualityLabels[decision.review.decision_quality]}
                      </div>
                    </div>

                    {/* Surprise */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">How surprised you were:</p>
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{decision.review.surprise_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full"
                          style={{ width: `${decision.review.surprise_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Would Repeat */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Would make this decision again:</p>
                      <p className="text-gray-700 dark:text-gray-400 text-sm">
                        {decision.review.would_repeat === 'yes' && '👍 Yes'}
                        {decision.review.would_repeat === 'unsure' && '🤔 Unsure'}
                        {decision.review.would_repeat === 'no' && '👎 No'}
                      </p>
                    </div>
                  </div>

                  {/* What Happened & Learning */}
                  <div className="border-t border-gray-300 dark:border-slate-700 pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💭 What actually happened:</p>
                      <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">{decision.review.what_happened}</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900/50">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">🎓 Your learning:</p>
                      <p className="text-blue-900 dark:text-blue-400 text-sm leading-relaxed">{decision.review.learning_note}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 flex gap-3 justify-center">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
          ← Back Home
        </Link>
      </div>
      </main>
    </div>
  );
}
