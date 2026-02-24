'use client';

import { useEffect, useState } from 'react';
import { decisionRepository, reviewRepository } from '@/lib';
import type { Decision } from '@/lib';

export default function DiagnosticsPage() {
  const [allDecisions, setAllDecisions] = useState<Decision[]>([]);
  const [dueDecisions, setDueDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const diagnose = async () => {
      try {
        console.log('📊 Running diagnostics...');

        // Get all decisions
        const all = await decisionRepository.getAll();
        setAllDecisions(all);
        console.log('All decisions:', all);

        // Get due decisions
        const due = await decisionRepository.getDueForReview();
        setDueDecisions(due);
        console.log('Due decisions:', due);

        // Get reviews
        const reviews = await reviewRepository.getAll();
        console.log('Reviews:', reviews);

        // Show timezone info
        console.log('Local timezone:', new Date().toString());
        console.log('UTC now:', new Date().toISOString());
        console.log('Today start (local):', new Date(new Date().setHours(0, 0, 0, 0)).toString());
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    diagnose();
  }, []);

  if (loading)
    return <div className="p-8">⏳ Loading diagnostics...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Diagnostics</h1>

        {/* All Decisions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            All Decisions ({allDecisions.length})
          </h2>
          {allDecisions.length === 0 ? (
            <p className="text-gray-500">No decisions found</p>
          ) : (
            <div className="space-y-4">
              {allDecisions.map((d) => (
                <div key={d.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-bold text-gray-900">{d.title}</p>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>
                      <strong>ID:</strong> {d.id}
                    </p>
                    <p>
                      <strong>Review Date:</strong> {new Date(d.review_date).toString()}
                    </p>
                    <p>
                      <strong>Review Date ISO:</strong> {new Date(d.review_date).toISOString()}
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(d.created_at).toString()}
                    </p>
                    <p>
                      <strong>Confidence:</strong> {d.confidence}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Decisions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Due Decisions ({dueDecisions.length})
          </h2>
          {dueDecisions.length === 0 ? (
            <p className="text-gray-500">
              ❌ No decisions are marked as due (this is the problem!)
            </p>
          ) : (
            <div className="space-y-4">
              {dueDecisions.map((d) => (
                <div key={d.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="font-bold text-gray-900">{d.title}</p>
                  <p className="text-sm text-gray-600">Review Date: {new Date(d.review_date).toString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Timestamp */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">Timezone Info</h3>
          <div className="space-y-2 text-sm text-gray-700 font-mono">
            <p>
              <strong>Current time (local):</strong> {new Date().toString()}
            </p>
            <p>
              <strong>Current time (UTC):</strong> {new Date().toISOString()}
            </p>
            <p>
              <strong>Today start (local):</strong>{' '}
              {new Date(new Date().setHours(0, 0, 0, 0)).toString()}
            </p>
            <p>
              <strong>Timezone offset:</strong> {new Date().getTimezoneOffset() / 60} hours from UTC
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">What to check:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Do you see your decision in "All Decisions"?</li>
            <li>✓ Is the "Review Date" set to today or earlier?</li>
            <li>✓ Does it appear in "Due Decisions"?</li>
            <li>✓ Check the console (F12) for exact timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
