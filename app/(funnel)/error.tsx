"use client"

import React from "react"
import Image from "next/image"

export default function Error() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="flex flex-col items-center space-y-6">
        <Image
          src="/white_logo.png"
          alt="Logo"
          height={64}
          width={128}
          className="h-16 w-auto mb-2"
          priority
        />
        <span className="text-zinc-100 text-lg font-medium">
          Oops! Something went wrong.
        </span>
        <span className="text-zinc-400 text-base text-center max-w-md">
          We couldn't load this tenant page. Please try refreshing, or contact
          support if the problem persists.
        </span>
      </div>
    </div>
  )
}
