import React from 'react';
import Image from 'next/image';

export function RedirectingMessage() {
  return (
    <div className="fixed inset-0 z-50 h-full w-full overflow-hidden bg-black">
      <Image
        src="/twighlight_loading.png"
        alt="Loading Background"
        fill
        style={{ objectFit: 'cover', zIndex: 1 }}
        className="h-full w-full transition-opacity duration-1000"
        priority
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-2xl font-bold text-white">Redirecting...</h1>
          <p className="text-gray-400">
            You are already signed in. Redirecting to your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <RedirectingMessage />;
}
