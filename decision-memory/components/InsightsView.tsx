'use client';

import { useEffect, useState } from 'react';
import { decisionRepository, reviewRepository, generateInsights } from '@/lib';
import type { Insights as LegacyInsights } from '@/lib';

export default function InsightsView() {
  const [insights, setInsights] = useState<LegacyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const decisions = await decisionRepository.getAll();
        const reviews = await reviewRepository.getAll();
        const generated = await generateInsights(decisions, reviews);
        setInsights(generated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate insights');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">⏳ Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Unable to load insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (insights.reviewCount < insights.minimumReviewsNeeded) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-8 text-center">
            <p className="text-2xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Patterns are still forming</h2>
            
            <div className="bg-white dark:bg-slate-900/50 rounded p-4 mb-4 text-left">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <strong>You've reviewed {insights.reviewCount} decision{insights.reviewCount !== 1 ? 's' : ''}.</strong>
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className={insights.reviewCount >= 3 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 3 reviews: Core insights appear (confidence, surprise, speed, repeat)
                </li>
                <li className={insights.reviewCount >= 8 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 8+ reviews: Segment patterns (deep behavioral patterns)
                </li>
                <li className={insights.reviewCount >= 12 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 12+ reviews: Trend analysis (improvement/decline over time)
                </li>
              </ul>
            </div>

            <p className="text-blue-600 dark:text-blue-400 font-medium">
              You need {insights.minimumReviewsNeeded - insights.reviewCount} more review{(insights.minimumReviewsNeeded - insights.reviewCount) !== 1 ? 's' : ''} to unlock core insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Here's how you think
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Based on {insights.reviewCount} decisions you've reviewed.
          </p>
        </div>

        {/* Insight Cards */}
        <div className="space-y-8">
          {/* Confidence Insight */}
          {insights.confidence && (
            <InsightCard
              emoji={insights.confidence.emoji}
              title="Confidence Reality Gap"
              message={insights.confidence.message}
              details={[
                `Average confidence: ${insights.confidence.averageConfidence}%`,
                `Well-calibrated: ${insights.confidence.wellCalibratedCount} decisions`,
                `Overconfident moments: ${insights.confidence.overconfidentCount}`,
                `Underconfident moments: ${insights.confidence.underconfidentCount}`,
              ]}
            />
          )}

          {/* Surprise Insight */}
          {insights.surprise && (
            <InsightCard
              emoji={insights.surprise.emoji}
              title="Surprise Patterns"
              message={insights.surprise.message}
              details={[
                `Average surprise score: ${insights.surprise.averageSurpriseScore}/100`,
                ...(insights.surprise.mostSurprisedDomain
                  ? [`Most surprising: ${insights.surprise.mostSurprisedDomain} decisions`]
                  : []),
                ...(insights.surprise.leastSurprisedDomain
                  ? [`Most predictable: ${insights.surprise.leastSurprisedDomain} decisions`]
                  : []),
              ]}
            />
          )}

          {/* Speed Insight */}
          {insights.speed && (
            <InsightCard
              emoji={insights.speed.emoji}
              title="Speed & Regret"
              message={insights.speed.message}
              details={[
                `Quick decisions regretted: ${insights.speed.quickDecisionsRegretRate}%`,
                `Moderate decisions regretted: ${insights.speed.moderateDecisionsRegretRate}%`,
                `Slow decisions regretted: ${insights.speed.slowDecisionsRegretRate}%`,
              ]}
            />
          )}

          {/* Repeat Insight */}
          {insights.repeat && (
            <InsightCard
              emoji={insights.repeat.emoji}
              title="Repeat Rate"
              message={insights.repeat.message}
              details={[
                `Would repeat: ${insights.repeat.repeatRate}%`,
                `Repeat-worthy decisions: ${insights.repeat.wouldRepeatCount}`,
                `Regretted decisions: ${insights.repeat.wouldNotRepeatCount}`,
                `Unsure about: ${insights.repeat.unsureCount}`,
              ]}
            />
          )}
        </div>

        {/* Reflection Prompt */}
        <div className="mt-16 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 border border-purple-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
            What stands out to you?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The most value comes from noticing patterns you didn't expect. 
            Take a moment to think: "Is this how I actually think?"
          </p>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8">
          Insights update as you log more decisions and reviews.
        </p>
      </div>
    </div>
  );
}

interface InsightCardProps {
  emoji: string;
  title: string;
  message: string;
  details: string[];
}

function InsightCard({ emoji, title, message, details }: InsightCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
        <ul className="space-y-2">
          {details.map((detail, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
              <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
