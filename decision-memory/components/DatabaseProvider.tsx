'use client';

import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/lib';
import { seedDatabase } from '@/lib/seedDatabase';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        await seedDatabase();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        setIsReady(true); // Mark as ready even on error to avoid infinite loading
      }
    };

    init();
  }, []);

  // Show loading state or error if needed
  if (error) {
    console.warn('Database initialization error:', error);
    // Still render children even on error - components will handle missing DB gracefully
  }

  return <>{children}</>;
}
