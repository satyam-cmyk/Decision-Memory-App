'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useDecisions, useDueDecisions } from '@/lib/hooks/useDatabase';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { decisions, loading } = useDecisions();
  const { decisions: dueDecisions } = useDueDecisions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">📔 Decision Memory</h1>
          <div className="flex gap-3 items-center">
            <Link
              href="/due"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
            >
              Due
            </Link>
            <Link
              href="/insights"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
            >
              Insights
            </Link>
            <Link
              href="/timeline"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
            >
              Timeline
            </Link>
            <Link
              href="/capture"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Log Decision
            </Link>
            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-slate-700">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Learn from your own decisions
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Track your reasoning, compare it to reality, and become a better decision-maker.
          </p>
          <Link
            href="/capture"
            className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            Log Your First Decision
          </Link>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Card 1: Decisions Logged */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-lg border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {loading ? '—' : decisions.length}
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Decisions Logged</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Each one is a learning opportunity.
            </p>
          </div>

          {/* Card 2: Due for Review */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-lg border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              {loading ? '—' : dueDecisions.length}
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Due for Review</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Time to close the feedback loop.
            </p>
            {dueDecisions.length > 0 && (
              <Link href="/due" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm mt-3 inline-block transition-colors">
                Review now ({dueDecisions.length}) →
              </Link>
            )}
          </div>

          {/* Card 3: Insights */}
          <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 rounded-lg shadow-sm dark:shadow-lg border border-purple-200 dark:border-slate-800 p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Patterns & Insights</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Discover how you think. After 5 reviews, patterns emerge.
            </p>
            <Link href="/insights" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-block transition-colors">
              View insights →
            </Link>
          </div>
        </div>

        {/* Recent Decisions */}
        {!loading && decisions.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Decisions</h3>
            <div className="space-y-3">
              {decisions.slice(0, 5).map((decision) => (
                <div key={decision.id} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 hover:border-gray-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{decision.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Confidence: <span className="font-medium">{decision.confidence}%</span> • 
                        Type: <span className="font-medium capitalize">{decision.decision_type}</span>
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Date(decision.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/timeline" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm mt-4 inline-block transition-colors">
              View all decisions →
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!loading && decisions.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-12 text-center">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start logging decisions</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Every decision is a chance to learn. Start with an important choice you made recently.
            </p>
            <Link
              href="/capture"
              className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Log Decision
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
