import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function TeamPageLoading() {
  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mt-2" />
        </header>

        <section className="mb-16">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <TeamMemberCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-8 w-48 mx-auto mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <TeamMemberCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function TeamMemberCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-square w-full" />

      <CardContent className="flex-1 flex flex-col p-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-3" />

        <div className="space-y-2 mb-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex gap-3 mt-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

