import { DashboardHeader } from "@/components/dashboard-header"
import { VitaminStats } from "@/components/vitamin-stats"
import { RecentVitamins } from "@/components/recent-vitamins"
import { QuickActions } from "@/components/quick-actions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">{"Here's your vitamin tracking overview"}</p>
        </div>

        <QuickActions />

        <VitaminStats />

        <RecentVitamins />
      </main>
    </div>
  )
}
