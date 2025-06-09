"use client";

import React from 'react';
import Image from 'next/image';

export default function Error() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="flex flex-col items-center space-y-6">
        <Image
          src="/white_logo.png"
          alt="Logo"
          height={64}
          width={128}
          className="mb-2 h-16 w-auto"
          priority
        />
        <span className="text-lg font-medium text-zinc-100">
          Oops! Something went wrong.
        </span>
        <span className="max-w-md text-center text-base text-zinc-400">
          We couldn't load this tenant page. Please try refreshing, or contact
          support if the problem persists.
        </span>
      </div>
    </div>
  );
}
