'use client';

import React from 'react';
import Image from 'next/image';

export default function Error() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <Image
          src="/white_logo.png"
          alt="Logo"
          height={64}
          width={128}
          className="mb-2 h-16 w-auto"
          priority
        />
        <span className="text-foreground text-lg font-medium">
          Oops! Something went wrong.
        </span>
        <span className="text-muted-foreground max-w-md text-center text-base">
          We couldn't load this tenant page. Please try refreshing, or contact
          support if the problem persists.
        </span>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 shadow-md transition-all duration-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
