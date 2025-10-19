"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import type { UserProfile, VitaminTablet, FoodLogEntry, DailyRecommendations } from "@/lib/firebase-helpers"
import {
  calculateDailyNeeds,
  calculateConsumedNutrients,
  calculateRemainingNeeds,
  calculateTabletRecommendations,
  getPercentageConsumed,
  formatNutrientName,
} from "@/lib/vitamin-calculator"
import { Pill, TrendingUp, CheckCircle2 } from "lucide-react"

export function VitaminRecommendations() {
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<DailyRecommendations | null>(null)
  const [consumed, setConsumed] = useState<{ [key: string]: number }>({})
  const [remaining, setRemaining] = useState<{ [key: string]: number }>({})
  const [tabletRecs, setTabletRecs] = useState<{ tablet: VitaminTablet; servings: number; nutrients: string[] }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return

      // Load user profile
      const profileDoc = await getDoc(doc(db, "users", user.uid))
      if (!profileDoc.exists()) {
        toast({ title: "Error", description: "Please complete onboarding first", variant: "destructive" })
        return
      }

      const profile = profileDoc.data() as UserProfile

      // Calculate daily needs
      const dailyNeeds = calculateDailyNeeds(profile)
      setRecommendations(dailyNeeds)

      // Load today's food log
      const today = new Date().toISOString().split("T")[0]
      const foodLogQuery = query(collection(db, "foodLog"), where("userId", "==", user.uid), where("date", "==", today))
      const foodLogSnapshot = await getDocs(foodLogQuery)
      const foodLog = foodLogSnapshot.docs.map((doc) => doc.data() as FoodLogEntry)

      // Calculate consumed nutrients
      const consumedNutrients = calculateConsumedNutrients(foodLog)
      setConsumed(consumedNutrients)

      // Calculate remaining needs
      const remainingNeeds = calculateRemainingNeeds(dailyNeeds, consumedNutrients)
      setRemaining(remainingNeeds)

      // Load user tablets
      const tabletsQuery = query(collection(db, "userTablets"), where("userId", "==", user.uid))
      const tabletsSnapshot = await getDocs(tabletsQuery)
      const tablets = tabletsSnapshot.docs.map((doc) => doc.data() as VitaminTablet)

      // Calculate tablet recommendations
      const tabletRecommendations = calculateTabletRecommendations(remainingNeeds, tablets)
      setTabletRecs(tabletRecommendations)
    } catch (error: any) {
      console.error("Load data error:", error)
      toast({ title: "Error", description: "Failed to load recommendations", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading recommendations...</p>
        </CardContent>
      </Card>
    )
  }

  if (!recommendations) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No recommendations available</p>
        </CardContent>
      </Card>
    )
  }

  const mainNutrients = ["vitaminC", "vitaminD", "vitaminB12", "calcium", "iron", "magnesium"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Today's Vitamin Progress
          </CardTitle>
          <CardDescription>Track your daily vitamin intake and see what you still need</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mainNutrients.map((nutrient) => {
            const recommended = recommendations[nutrient as keyof DailyRecommendations] as number
            const consumedAmount = consumed[nutrient] || 0
            const percentage = getPercentageConsumed(consumedAmount, recommended)
            const isComplete = percentage >= 100

            return (
              <div key={nutrient} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{formatNutrientName(nutrient)}</span>
                    {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {consumedAmount.toFixed(1)} / {recommended} {nutrient.includes("vitamin") ? "mg" : "mg"}
                  </span>
                </div>
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">{percentage}% of daily goal</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {tabletRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              Recommended Supplements
            </CardTitle>
            <CardDescription>Based on your remaining daily needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tabletRecs.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{rec.tablet.name}</h4>
                    <p className="text-sm text-muted-foreground">{rec.tablet.brand}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {rec.servings}x
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Helps with:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.nutrients.map((nutrient) => (
                      <Badge key={nutrient} variant="outline" className="text-xs">
                        {formatNutrientName(nutrient)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  Mark as Taken
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tabletRecs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">You're all set!</h3>
            <p className="text-sm text-muted-foreground">
              You've met your daily vitamin goals. No additional supplements needed today.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
