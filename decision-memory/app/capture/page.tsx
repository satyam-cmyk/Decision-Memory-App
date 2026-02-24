'use client';

import DecisionCaptureForm from '@/components/DecisionCaptureForm';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';


export default function CaptureDecisionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4 transition-colors">
      {/* Navigation Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors">
            ← Back Home
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Log a Decision</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Capture the moment you make a meaningful choice. This helps you learn from your own decisions.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-lg border border-gray-200 dark:border-slate-800 p-6 md:p-8 mb-8">
          <DecisionCaptureForm />
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
            <div className="font-semibold text-gray-900 dark:text-white mb-1">💭 Be specific</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Write your actual reasoning, not just the outcome you want.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
            <div className="font-semibold text-gray-900 dark:text-white mb-1">🎯 Set a real review date</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This triggers a reminder. Pick a date when you&apos;ll know the outcome.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
            <div className="font-semibold text-gray-900 dark:text-white mb-1">⏱️ Move fast</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t overthink. The goal is to build the habit of logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
