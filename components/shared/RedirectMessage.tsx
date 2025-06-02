import React from "react";
import Image from "next/image";

export function RedirectingMessage() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-50">
      <Image
        src="/twighlight_loading.png"
        alt="Loading Background"
        fill
        style={{ objectFit: "cover", zIndex: 1 }}
        className="w-full h-full transition-opacity duration-1000"
        priority
      />
      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-2xl font-bold text-white">Redirecting...</h1>
          <p className="text-gray-400">You are already signed in. Redirecting to your dashboard.</p>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <RedirectingMessage />;
}
