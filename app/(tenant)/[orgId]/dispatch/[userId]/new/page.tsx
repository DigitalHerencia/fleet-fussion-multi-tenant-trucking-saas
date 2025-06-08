'use client';

import { useEffect, useState } from 'react';

import { LoadForm } from '@/components/dispatch/load-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth/context';

export default function NewLoadPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { company } = useAuth();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!company) {
    return <div>Company not found. Please create a company first.</div>;
  }

  return (
    <>
      <div className="mt-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="mt-6">
        <LoadForm drivers={[]} vehicles={[]} />
      </div>
    </>
  );
}
