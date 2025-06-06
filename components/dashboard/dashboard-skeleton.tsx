import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * DashboardSkeleton
 *
 * Closely matches the actual dashboard page layout:
 * - FleetOverviewHeader (top)
 * - KPI Grid (4 cards)
 * - Bottom widgets grid (3 tall cards)
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-900 p-4 md:p-6 lg:p-8 flex flex-col gap-8">
      {/* Fleet Overview Header */}
      <div>
        <Skeleton className="h-12 w-full mb-2" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-4 w-[140px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-2/3 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
