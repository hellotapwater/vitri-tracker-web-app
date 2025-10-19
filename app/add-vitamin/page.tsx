import { DashboardHeader } from "@/components/dashboard-header"
import { AddVitaminForm } from "@/components/add-vitamin-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AddVitaminPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance mb-2">Add Vitamin</h2>
          <p className="text-muted-foreground">Log your daily vitamin intake</p>
        </div>

        <AddVitaminForm />
      </main>
    </div>
  )
}
