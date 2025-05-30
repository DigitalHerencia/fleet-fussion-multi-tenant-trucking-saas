import React from "react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import Image from "next/image"

export default function Loading() {
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
        <LoadingSpinner />
        <span className="text-zinc-100 text-lg font-medium">Loading...</span>
      </div>
    </div>
  )
}
