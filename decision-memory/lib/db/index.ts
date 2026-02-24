/**
 * Database initialization and client-side utilities
 */

import { db } from '@/lib/db/schema';

/**
 * Initialize the database
 * Call this once when the app loads (in a root layout or context)
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection by doing a simple count
    await db.decisions.count();
    console.log('✓ Decision Memory database initialized');
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Clear all data (useful for testing/reset)
 * WARNING: This is destructive and cannot be undone
 */
export async function clearDatabase(): Promise<void> {
  if (typeof window !== 'undefined' && !window.confirm('Clear all decision data? This cannot be undone.')) {
    return;
  }

  try {
    await db.decisions.clear();
    await db.reviews.clear();
    await db.assumptions.clear();
    console.log('✓ Database cleared');
  } catch (error) {
    console.error('✗ Failed to clear database:', error);
    throw error;
  }
}

/**
 * Export all data as JSON
 */
export async function exportDatabase(): Promise<{
  decisions: any[];
  reviews: any[];
  assumptions: any[];
  exportedAt: string;
}> {
  const [decisions, reviews, assumptions] = await Promise.all([
    db.decisions.toArray(),
    db.reviews.toArray(),
    db.assumptions.toArray(),
  ]);

  return {
    decisions,
    reviews,
    assumptions,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import data from JSON
 */
export async function importDatabase(data: {
  decisions?: any[];
  reviews?: any[];
  assumptions?: any[];
}): Promise<void> {
  try {
    if (data.decisions) {
      await db.decisions.bulkAdd(data.decisions);
    }
    if (data.reviews) {
      await db.reviews.bulkAdd(data.reviews);
    }
    if (data.assumptions) {
      await db.assumptions.bulkAdd(data.assumptions);
    }
    console.log('✓ Data imported successfully');
  } catch (error) {
    console.error('✗ Failed to import data:', error);
    throw error;
  }
}
