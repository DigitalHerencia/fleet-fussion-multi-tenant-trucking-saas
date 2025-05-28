"use client"
import Link from "next/link"
import { MapPinned } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 h-16 flex items-center border-b bg-black dark:bg-black">
      <div className="flex flex-1 items-center">
        <Link className="flex items-center justify-center hover:text-blue-500 hover:underline underline-offset-4" href="/">
          <MapPinned className="h-6 w-6 text-blue-500 mr-1" />
          <span className="font-extrabold text-white dark:text-white text-2xl">FleetFusion</span>
        </Link>
      </div>      
      <nav className="flex text-white items-center gap-6">
        <Link className="text-sm font-medium hover:text-blue-500 hover:underline underline-offset-4" href="/features">
          Features
        </Link>
        <Link className="text-sm font-medium hover:text-blue-500 hover:underline underline-offset-4" href="/pricing">
          Pricing
        </Link>
        <Link className="text-sm font-medium hover:text-blue-500 hover:underline underline-offset-4" href="/about">
          About
        </Link>
        <Button asChild className="text-sm font-medium bg-blue-500 hover:bg-blue-800 text-white">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </nav>
    </header>
  )
}