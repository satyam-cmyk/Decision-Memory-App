import DebugDatabaseView from '@/components/DebugDatabaseView';

export const metadata = {
  title: 'Debug Database | Decision Memory',
  description: 'View raw database contents',
};

export default function DebugPage() {
  return <DebugDatabaseView />;
}
