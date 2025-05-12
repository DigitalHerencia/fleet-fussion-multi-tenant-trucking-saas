// components/ui/loading-skeleton.tsx
"use client";
import { Skeleton } from "../../components/ui/skeleton";
import type { ReactNode } from "react";

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={className || "space-y-2"}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
