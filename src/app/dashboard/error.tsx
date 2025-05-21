'use client'; // Error components must be Client Components

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h2 className="text-3xl font-semibold text-destructive mb-4">Oops! Something went wrong.</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We encountered an error while trying to load the dashboard. Please try again.
      </p>
      <p className="text-sm text-muted-foreground mb-2">Error details: {error.message}</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        Try again
      </Button>
    </div>
  );
}
