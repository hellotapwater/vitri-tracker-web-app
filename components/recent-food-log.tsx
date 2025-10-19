"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import type { FoodLogEntry } from "@/lib/firebase-helpers"
import { UtensilsCrossed, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecentFoodLog() {
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadFoodLog()
  }, [])

  const loadFoodLog = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const today = new Date().toISOString().split("T")[0]
      const foodLogQuery = query(
        collection(db, "foodLog"),
        where("userId", "==", user.uid),
        where("date", "==", today),
        orderBy("timestamp", "desc"),
        limit(5),
      )

      const snapshot = await getDocs(foodLogQuery)
      const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FoodLogEntry)
      setFoodLog(entries)
    } catch (error) {
      console.error("Load food log error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMealTypeColor = (mealType: string) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-orange-100 text-orange-800",
      dinner: "bg-purple-100 text-purple-800",
      snack: "bg-green-100 text-green-800",
    }
    return colors[mealType as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
              Today's Food Log
            </CardTitle>
            <CardDescription>Track what you've eaten today</CardDescription>
          </div>
          <Button size="sm" onClick={() => router.push("/add-food")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Food
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : foodLog.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No meals logged today</p>
            <Button onClick={() => router.push("/add-food")}>Log Your First Meal</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {foodLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{entry.foodName}</h4>
                    <Badge className={getMealTypeColor(entry.mealType)}>{entry.mealType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(entry.nutrients)
                      .slice(0, 3)
                      .map(([nutrient, value]) => (
                        <span key={nutrient} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                          {nutrient}: {value}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
