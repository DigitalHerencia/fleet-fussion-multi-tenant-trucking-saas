"use client";

import React from "react";
import Image from "next/image";

export default function Error() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-6">
        <Image
          src="/white_logo.png"
          alt="Logo"
          height={64}
          width={128}
          className="h-16 w-auto mb-2"
          priority
        />
        <span className="text-foreground text-lg font-medium">
          Oops! Something went wrong.
        </span>
        <span className="text-muted-foreground text-base text-center max-w-md">
          We couldn't load this tenant page. Please try refreshing, or contact
          support if the problem persists.
        </span>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-md hover:bg-primary/90 transition-all duration-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
