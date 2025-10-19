"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import type { FoodLogEntry } from "@/lib/firebase-helpers"
import { History, UtensilsCrossed, Pill, Calendar } from "lucide-react"

export default function HistoryPage() {
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([])
  const [vitamins, setVitamins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        router.push("/login")
        return
      }

      const foodLogQuery = query(
        collection(db, "foodLog"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(50),
      )
      const foodLogSnapshot = await getDocs(foodLogQuery)
      const foodLogData = foodLogSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FoodLogEntry)
      setFoodLog(foodLogData)

      const vitaminsQuery = query(
        collection(db, "vitamins"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(50),
      )
      const vitaminsSnapshot = await getDocs(vitaminsQuery)
      const vitaminsData = vitaminsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setVitamins(vitaminsData)
    } catch (error) {
      console.error("Load history error:", error)
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

  const groupByDate = (entries: any[]) => {
    const grouped: { [key: string]: any[] } = {}
    entries.forEach((entry) => {
      const date = entry.date || new Date(entry.timestamp).toISOString().split("T")[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(entry)
    })
    return grouped
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    )
  }

  const groupedFoodLog = groupByDate(foodLog)
  const groupedVitamins = groupByDate(vitamins)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-balance mb-2 flex items-center gap-2">
            <History className="h-8 w-8 text-emerald-600" />
            Your History
          </h2>
          <p className="text-muted-foreground">View your past food logs and vitamin entries</p>
        </div>

        <Tabs defaultValue="food" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="food">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Food Log
            </TabsTrigger>
            <TabsTrigger value="vitamins">
              <Pill className="h-4 w-4 mr-2" />
              Vitamins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="space-y-6">
            {Object.keys(groupedFoodLog).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No food logs yet</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedFoodLog).map(([date, entries]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <CardDescription>{entries.length} meals logged</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entries.map((entry: FoodLogEntry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{entry.foodName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <Badge className={getMealTypeColor(entry.mealType)}>{entry.mealType}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(entry.nutrients)
                            .slice(0, 5)
                            .map(([nutrient, value]) => (
                              <span key={nutrient} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                                {nutrient}: {value}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="vitamins" className="space-y-6">
            {Object.keys(groupedVitamins).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No vitamin entries yet</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedVitamins).map(([date, entries]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <CardDescription>{entries.length} vitamins logged</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entries.map((entry: any) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{entry.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {entry.amount} {entry.unit}
                          </Badge>
                        </div>
                        {entry.category && (
                          <Badge variant="outline" className="text-xs">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
