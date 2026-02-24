# Database Architecture

Decision Memory uses a **repository pattern** to abstract database operations from the UI layer. This makes it easy to swap from IndexedDB to SQLite or MongoDB later.

## Structure

```
lib/
├── types/
│   └── index.ts           # TypeScript interfaces
├── db/
│   ├── schema.ts          # Dexie IndexedDB setup
│   ├── index.ts           # Database utilities
│   └── repositories/
│       ├── decisionRepository.ts
│       └── reviewRepository.ts
└── index.ts               # Central exports
```

## Tables

### `decisions`
Represents the moment a choice is made.

**Fields:**
- `id` (primary key)
- `title` - Brief description of the decision
- `reasoning` - Why you made this choice
- `confidence` - 0-100 scale
- `decision_type` - personal | work | finance | health | other
- `importance` - low | medium | high
- `expected_outcome` - What you expect to happen
- `review_date` - When you plan to review the outcome
- `created_at` - Timestamp
- `updated_at` - Timestamp

### `reviews`
Represents reflection after outcome.

**Fields:**
- `id` (primary key)
- `decision_id` (foreign key)
- `outcome` - success | partial | fail
- `what_happened` - What actually happened
- `surprise` - 0-100 scale (how different from expectation)
- `would_repeat` - yes | no | null
- `reviewed_at` - Timestamp
- `created_at` - Timestamp
- `updated_at` - Timestamp

### `assumptions` (Phase 1+)
Tracks assumptions a decision was based on.

**Fields:**
- `id` (primary key)
- `decision_id` (foreign key)
- `assumption_text` - The assumption
- `confidence` - 0-100 scale
- `created_at` - Timestamp

## Usage

### Import repositories

```typescript
import { decisionRepository, reviewRepository } from '@/lib';
```

### Create a decision

```typescript
const decisionId = await decisionRepository.create({
  title: 'Switch to Next.js for new project',
  reasoning: 'Better performance, built-in optimization',
  confidence: 85,
  decision_type: 'work',
  importance: 'high',
  expected_outcome: 'Faster development and better UX',
  review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
});
```

### Get all decisions

```typescript
const decisions = await decisionRepository.getAll();
```

### Get decisions due for review

```typescript
const dueDecisions = await decisionRepository.getDueForReview();
```

### Create a review

```typescript
await reviewRepository.create({
  decision_id: decisionId,
  outcome: 'success',
  what_happened: 'Project shipped 2 weeks faster than expected',
  surprise: 25,
  would_repeat: 'yes',
  reviewed_at: new Date(),
});
```

### Get review for a decision

```typescript
const review = await reviewRepository.getByDecisionId(decisionId);
```

## Database Initialization

Call this once when the app loads (recommended in `app/layout.tsx`):

```typescript
import { initializeDatabase } from '@/lib';

export default async function RootLayout({ children }) {
  await initializeDatabase();
  return <html>{children}</html>;
}
```

## Data Export/Import

```typescript
import { exportDatabase, importDatabase } from '@/lib';

// Export as JSON
const data = await exportDatabase();
console.log(JSON.stringify(data, null, 2));

// Import from JSON
await importDatabase(data);
```

## Future Database Migration

To migrate to SQLite or MongoDB:

1. Create new repository implementations (e.g., `decisionRepository.sqlite.ts`)
2. Update the repository imports
3. UI code remains **completely unchanged**

Example:
```typescript
// Before (IndexedDB)
import { decisionRepository } from '@/lib/db/repositories/decisionRepository';

// After (SQLite - no UI changes needed!)
import { decisionRepository } from '@/lib/db/repositories/decisionRepository.sqlite';
```
