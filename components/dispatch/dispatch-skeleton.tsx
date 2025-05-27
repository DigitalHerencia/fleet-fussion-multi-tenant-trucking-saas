import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DispatchSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="w-full">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-40 mt-1" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-4 w-4 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-4 w-4 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-4 w-4 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
