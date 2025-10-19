"use client"

import { AddFoodForm } from "@/components/add-food-form"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AddFoodPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-balance mb-2">Log Your Food</h2>
          <p className="text-muted-foreground">Track your meals and vitamin intake</p>
        </div>
        <AddFoodForm />
      </main>
    </div>
  )
}
