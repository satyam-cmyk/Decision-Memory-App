import Dexie, { Table } from 'dexie';
import { Decision, Review, Assumption } from '@/lib/types';

/**
 * IndexedDB Database Schema
 * 
 * This provides typed access to our local-first database.
 * Repository layer abstracts away IndexedDB-specific logic.
 */
export class DecisionMemoryDB extends Dexie {
  decisions!: Table<Decision>;
  reviews!: Table<Review>;
  assumptions!: Table<Assumption>;

  constructor() {
    super('DecisionMemory');
    this.version(1).stores({
      decisions: '++id, created_at, review_date, decision_type, decision_speed',
      reviews: '++id, decision_id, reviewed_at',
      assumptions: '++id, decision_id',
    });
  }
}

/**
 * Singleton instance of the database
 * Only instantiated once in the app lifecycle
 */
export const db = new DecisionMemoryDB();

export default db;
