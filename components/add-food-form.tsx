"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"
import { addDoc, collection } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { searchFoods, extractVitaminContent, type USDAFood } from "@/lib/usda-api"
import type { FoodLogEntry } from "@/lib/firebase-helpers"

export function AddFoodForm() {
  const [foodName, setFoodName] = useState("")
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<USDAFood[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedNutrients, setSelectedNutrients] = useState<{ [key: string]: number }>({})
  const router = useRouter()
  const { toast } = useToast()

  const handleSearchUSDA = async () => {
    if (!foodName) {
      toast({ title: "Error", description: "Please enter a food name", variant: "destructive" })
      return
    }

    setIsSearching(true)
    setShowResults(false)

    try {
      const results = await searchFoods(foodName)
      setSearchResults(results)
      setShowResults(true)

      if (results.length === 0) {
        toast({ title: "No Results", description: "Try a different search term" })
      }
    } catch (error) {
      console.error("USDA search error:", error)
      toast({ title: "Error", description: "Failed to search USDA database", variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectFood = (food: USDAFood) => {
    setFoodName(food.description)
    const vitamins = extractVitaminContent(food)

    const nutrients: { [key: string]: number } = {}
    vitamins.forEach((vitamin) => {
      const key = vitamin.nutrientName.toLowerCase().replace(/[^a-z0-9]/g, "")
      nutrients[key] = vitamin.value
    })

    setSelectedNutrients(nutrients)
    setShowResults(false)

    toast({ title: "Food Selected", description: `${food.description} - ${vitamins.length} nutrients found` })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = auth.currentUser
      if (!user) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" })
        router.push("/login")
        return
      }

      const today = new Date().toISOString().split("T")[0]
      const entry: Omit<FoodLogEntry, "id"> = {
        userId: user.uid,
        foodName,
        mealType,
        nutrients: selectedNutrients,
        timestamp: new Date().toISOString(),
        date: today,
      }

      await addDoc(collection(db, "foodLog"), entry)

      toast({ title: "Success", description: "Food logged successfully!" })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Save food error:", error)
      toast({ title: "Error", description: error.message || "Failed to log food", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Meal</CardTitle>
        <CardDescription>Search for food and track your vitamin intake</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="foodName">Food Name</Label>
            <div className="flex gap-2">
              <Input
                id="foodName"
                type="text"
                placeholder="e.g., Apple, Chicken Breast, Spinach"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleSearchUSDA} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {searchResults.map((food) => {
                  const vitamins = extractVitaminContent(food)
                  return (
                    <button
                      key={food.fdcId}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">{food.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {food.brandName && <span className="mr-2">{food.brandName}</span>}
                        <span>{vitamins.length} nutrients found</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {Object.keys(selectedNutrients).length > 0 && (
            <div className="space-y-2">
              <Label>Detected Nutrients</Label>
              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
                {Object.entries(selectedNutrients).map(([nutrient, value]) => (
                  <span key={nutrient} className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    {nutrient}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
              <SelectTrigger id="mealType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || Object.keys(selectedNutrients).length === 0}
            >
              {isLoading ? "Logging..." : "Log Food"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
