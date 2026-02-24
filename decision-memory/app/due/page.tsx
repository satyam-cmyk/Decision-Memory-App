'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { decisionRepository } from '@/lib';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Decision } from '@/lib';

export default function DueQueuePage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDue = async () => {
      try {
        const due = await decisionRepository.getDueForReview();
        setDecisions(due);
      } catch (error) {
        console.error('Failed to fetch due decisions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDue();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">📋 Due for Review</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
            >
              Back
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">⏳ Loading...</p>
          </div>
        ) : decisions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All caught up!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              No decisions are due for review right now. Keep logging new decisions and check back later.
            </p>
            <Link
              href="/capture"
              className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Log a Decision
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                You have <span className="font-bold text-orange-600 dark:text-orange-400">{decisions.length}</span> decision{decisions.length === 1 ? '' : 's'} ready for review.
              </p>
            </div>

            <div className="space-y-4">
              {decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white break-words">{decision.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Due: {new Date(decision.review_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 whitespace-nowrap">
                      {decision.confidence}% confident
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{decision.reasoning}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                        {decision.decision_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Expected:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{decision.expected_outcome}</span>
                    </div>
                  </div>

                  <Link
                    href={`/due/${decision.id}`}
                    className="inline-block bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Review Now
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
