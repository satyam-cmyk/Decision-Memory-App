'use client';

import { useEffect, useState } from 'react';
import ReviewDecisionForm from '@/components/ReviewDecisionForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  if (!id) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">📝 Review Decision</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/due"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
            >
              Back
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <ReviewDecisionForm decisionId={id} />
      </main>
    </div>
  );
}
