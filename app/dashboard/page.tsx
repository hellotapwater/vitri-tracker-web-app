"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { VitaminRecommendations } from "@/components/vitamin-recommendations"
import { RecentFoodLog } from "@/components/recent-food-log"
import { QuickActions } from "@/components/quick-actions"
import { DailyOverview } from "@/components/daily-overview"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function DashboardPage() {
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUserName(userData.name || "")

          if (!userData.onboardingComplete) {
            router.push("/onboarding")
            return
          }
        } else {
          router.push("/onboarding")
          return
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance mb-2">Welcome back{userName ? `, ${userName}` : ""}!</h2>
          <p className="text-muted-foreground">Track your daily vitamin intake and stay healthy</p>
        </div>

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <VitaminRecommendations />
            <RecentFoodLog />
          </div>
          <div className="lg:col-span-1">
            <DailyOverview />
          </div>
        </div>
      </main>
    </div>
  )
}
