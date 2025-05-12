"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from 'react'

interface FlexLayoutProps {
  children: ReactNode
  direction?: "row" | "column"
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"
  align?: "start" | "end" | "center" | "baseline" | "stretch"
  className?: string
  wrap?: boolean
  responsive?: boolean
}

/**
 * A flexible layout component that standardizes common flex patterns
 * 
 * @example
 * <FlexLayout justify="between" align="center">
 *   <LeftContent />
 *   <RightContent />
 * </FlexLayout>
 * 
 * @example
 * <FlexLayout direction="column" responsive gap="lg">
 *   <TopContent />
 *   <BottomContent />
 * </FlexLayout>
 */
export function FlexLayout({
  children,
  direction = "row",
  gap = "md",
  justify = "start",
  align = "start",
  className,
  wrap = false,
  responsive = false
}: FlexLayoutProps) {
  const gapMap = {
    none: "",
    xs: "gap-1",
    sm: "gap-2", 
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  }
  
  const justifyMap = {
    start: "justify-start",
    end: "justify-end",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly"
  }
  
  const alignMap = {
    start: "items-start",
    end: "items-end",
    center: "items-center",
    baseline: "items-baseline",
    stretch: "items-stretch"
  }
  
  return (
    <div 
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        responsive && direction === "column" && "sm:flex-row",
        responsive && direction === "row" && "sm:flex-col",
        gapMap[gap],
        justifyMap[justify],
        alignMap[align],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  )
}
