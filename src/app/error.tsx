"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive">Error</h1>
        <p className="mt-4 text-muted-foreground">
          {error.message || "Something went wrong"}
        </p>
        <Button className="mt-6" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
