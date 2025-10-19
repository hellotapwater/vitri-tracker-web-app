"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Calendar, Flame, Droplet } from "lucide-react"

export function DailyOverview() {
  const [stats, setStats] = useState({
    mealsLogged: 0,
    vitaminsTracked: 0,
    waterIntake: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      const foodLogQuery = query(collection(db, "foodLog"), where("userId", "==", user.uid), where("date", "==", today))
      const foodLogSnapshot = await getDocs(foodLogQuery)

      const vitaminsQuery = query(
        collection(db, "vitamins"),
        where("userId", "==", user.uid),
        where("timestamp", ">=", new Date(today).toISOString()),
      )
      const vitaminsSnapshot = await getDocs(vitaminsQuery)

      setStats({
        mealsLogged: foodLogSnapshot.size,
        vitaminsTracked: vitaminsSnapshot.size,
        waterIntake: 6,
      })
    } catch (error) {
      console.error("Load stats error:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Today's Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Flame className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Meals Logged</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.mealsLogged}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Droplet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Vitamins Tracked</p>
              <p className="text-2xl font-bold text-blue-600">{stats.vitaminsTracked}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weekly Average</span>
              <Badge variant="secondary">4.2 meals/day</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Streak</span>
              <Badge variant="secondary">7 days</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Goal Progress</span>
              <Badge className="bg-emerald-600">85%</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
