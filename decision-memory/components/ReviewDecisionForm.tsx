'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { decisionRepository, reviewRepository } from '@/lib';
import type { Decision, ExpectationComparison, DecisionQuality, WouldRepeat } from '@/lib';

interface ReviewDecisionFormProps {
  decisionId: string;
}

export default function ReviewDecisionForm({ decisionId }: ReviewDecisionFormProps) {
  const [decision, setDecision] = useState<Decision | undefined>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    expectation_comparison: 'as_expected' as ExpectationComparison,
    decision_quality: 'reasonable' as DecisionQuality,
    surprise_score: 25,
    what_happened: '',
    learning_note: '',
    would_repeat: 'yes' as WouldRepeat,
  });

  // Load decision
  useEffect(() => {
    const loadDecision = async () => {
      try {
        const dec = await decisionRepository.getById(decisionId);
        if (!dec) {
          setError('Decision not found');
          return;
        }
        setDecision(dec);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load decision');
      } finally {
        setLoading(false);
      }
    };

    loadDecision();
  }, [decisionId]);

  // Handle form changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'surprise_score' ? parseInt(value, 10) : value,
      }));
    },
    []
  );

  // Handle submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!decision) return;

      try {
        setSubmitting(true);
        setError(null);

        // Validate required fields
        if (!formData.what_happened.trim()) {
          setError('Please describe what actually happened');
          setSubmitting(false);
          return;
        }
        if (!formData.learning_note.trim()) {
          setError('Please share what you learned from this outcome');
          setSubmitting(false);
          return;
        }

        await reviewRepository.create({
          decision_id: String(decision.id),
          expectation_comparison: formData.expectation_comparison,
          decision_quality: formData.decision_quality,
          surprise_score: formData.surprise_score,
          what_happened: formData.what_happened.trim(),
          learning_note: formData.learning_note.trim(),
          would_repeat: formData.would_repeat,
          reviewed_at: new Date(),
        });

        setCompleted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save review');
      } finally {
        setSubmitting(false);
      }
    },
    [decision, formData]
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">⏳ Loading decision...</p>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-900/50 p-8 text-center">
        <p className="text-red-800 dark:text-red-400 font-medium">❌ {error}</p>
        <Link href="/due" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-4 inline-block transition-colors">
          Back to Due Queue
        </Link>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Decision not found</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-green-200 dark:border-green-900/50 p-8 md:p-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review saved!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You&apos;ve reflected on this decision. Over time, these patterns will reveal how you think and where you can improve.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/due"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Due Queue
          </Link>
          <Link
            href="/timeline"
            className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            View Timeline
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 md:p-8">
      {/* Original Decision Summary */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Original Decision</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Decision:</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">{decision.title}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Your reasoning:</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">{decision.reasoning}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">What you expected:</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">{decision.expected_outcome}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Confidence:</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">{decision.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reflect on this decision</h3>

        {/* 1. Reality vs Expectation */}
        <div>
          <label htmlFor="expectation_comparison" className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            How did the outcome compare to what you expected? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: 'much_better', label: '⬆️ Much better than expected', description: 'Exceeded expectations significantly' },
              { value: 'slightly_better', label: '↗️ Slightly better than expected', description: 'Better than anticipated' },
              { value: 'as_expected', label: '➡️ About as expected', description: 'Unfolded roughly as predicted' },
              { value: 'slightly_worse', label: '↘️ Slightly worse than expected', description: 'Worse than anticipated' },
              { value: 'much_worse', label: '⬇️ Much worse than expected', description: 'Fell well short of expectations' },
            ].map((option) => (
              <label key={option.value} className="flex items-start p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="radio"
                  name="expectation_comparison"
                  value={option.value}
                  checked={formData.expectation_comparison === option.value}
                  onChange={handleChange}
                  disabled={submitting}
                  className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Decision Process Quality */}
        <div>
          <label htmlFor="decision_quality" className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            How sound was your decision-making process? <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            This is about the quality of your thinking at the time, not the outcome. A good decision can have a bad result, and vice versa.
          </p>
          <div className="space-y-2">
            {[
              { value: 'very_thoughtful', label: '🧠 Very thoughtful and informed', description: 'Well-researched, considered multiple factors' },
              { value: 'reasonable', label: '✓ Reasonable', description: 'Sound thinking given what you knew' },
              { value: 'acceptable', label: '⚡ Acceptable', description: 'Adequate but could have been more thorough' },
              { value: 'rushed', label: '⏱️ Rushed', description: 'Made under time pressure' },
              { value: 'emotional', label: '🔥 Emotional / reactive', description: 'Driven more by emotion than reasoning' },
            ].map((option) => (
              <label key={option.value} className="flex items-start p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="radio"
                  name="decision_quality"
                  value={option.value}
                  checked={formData.decision_quality === option.value}
                  onChange={handleChange}
                  disabled={submitting}
                  className="mt-1 w-4 h-4 text-emerald-600 dark:text-emerald-400"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Surprise Level */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="surprise_score" className="text-sm font-bold text-gray-900 dark:text-white">
              How surprised were you by the outcome? <span className="text-red-500">*</span>
            </label>
            <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">{formData.surprise_score}%</span>
          </div>
          <input
            id="surprise_score"
            type="range"
            name="surprise_score"
            min="0"
            max="100"
            value={formData.surprise_score}
            onChange={handleChange}
            disabled={submitting}
            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>Exactly as I predicted</span>
            <span>Completely unexpected</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            High surprise indicates your mental model was off—a key learning opportunity.
          </p>
        </div>

        {/* 4. What Happened */}
        <div>
          <label htmlFor="what_happened" className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
            What actually happened? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="what_happened"
            name="what_happened"
            value={formData.what_happened}
            onChange={handleChange}
            placeholder="Describe the actual outcome. What did you observe? What went different?"
            rows={3}
            disabled={submitting}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          />
        </div>

        {/* 5. Learning Reflection */}
        <div>
          <label htmlFor="learning_note" className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
            What was the biggest thing you learned? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="learning_note"
            name="learning_note"
            value={formData.learning_note}
            onChange={handleChange}
            placeholder="What did this outcome reveal about how you think? What assumptions were wrong? What would you do differently?"
            rows={4}
            disabled={submitting}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            This is the core insight. Focus on what this tells you about your thinking, not just the outcome.
          </p>
        </div>

        {/* 6. Would Repeat */}
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Would you make the same decision again? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: 'yes', label: '👍 Yes', description: 'Would choose the same path again' },
              { value: 'unsure', label: '🤔 Unsure', description: 'Context-dependent or mixed feelings' },
              { value: 'no', label: '👎 No', description: 'Would choose differently' },
            ].map((option) => (
              <label key={option.value} className="flex items-start p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="radio"
                  name="would_repeat"
                  value={option.value}
                  checked={formData.would_repeat === option.value}
                  onChange={handleChange}
                  disabled={submitting}
                  className="mt-1 w-4 h-4 text-green-600 dark:text-green-400"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : '💾 Save Review & Learn'}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
        This reflection is for you. It's about understanding your thinking, not judging yourself. The honest insight here is what makes the system work.
      </p>
    </div>
  );
}
