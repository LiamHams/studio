import { getTunnelsAction } from '@/lib/actions';
import { TunnelList } from '@/components/dashboard/TunnelList';
import { AddTunnelDialog } from '@/components/dashboard/AddTunnelDialog';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function TunnelListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm bg-card">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}


async function TunnelsDisplay() {
  // This component is async because it fetches data.
  // The actual tunnel management actions are Server Actions, not direct API calls from here.
  const tunnels = await getTunnelsAction();
  return <TunnelList tunnels={tunnels} />;
}

export default async function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tunnel Management
        </h1>
        <AddTunnelDialog />
      </div>
      <Suspense fallback={<TunnelListSkeleton />}>
        <TunnelsDisplay />
      </Suspense>
    </div>
  );
}

// Force dynamic rendering to ensure middleware and auth checks run on each request for this page.
// This can be important if auth state might change frequently or if usingedge runtime middleware.
// For Vercel, this ensures it's a dynamic function.
export const dynamic = 'force-dynamic';
