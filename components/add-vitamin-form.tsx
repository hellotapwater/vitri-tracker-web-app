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

export function AddVitaminForm() {
  const [vitaminName, setVitaminName] = useState("")
  const [amount, setAmount] = useState("")
  const [unit, setUnit] = useState("mg")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<USDAFood[]>([])
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearchUSDA = async () => {
    if (!vitaminName) {
      toast({ title: "Error", description: "Please enter a vitamin or food name", variant: "destructive" })
      return
    }

    setIsSearching(true)
    setShowResults(false)

    try {
      const results = await searchFoods(vitaminName)
      console.log("[v0] USDA search results:", results)
      setSearchResults(results)
      setShowResults(true)

      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No foods found. Try a different search term.",
        })
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${results.length} results. Click on a food to see vitamin content.`,
        })
      }
    } catch (error) {
      console.error("[v0] USDA search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search USDA database. Please check your API key.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectFood = (food: USDAFood) => {
    setVitaminName(food.description)
    const vitamins = extractVitaminContent(food)

    if (vitamins.length > 0) {
      const firstVitamin = vitamins[0]
      setAmount(firstVitamin.value.toString())
      setUnit(firstVitamin.unitName.toLowerCase())
    }

    setShowResults(false)

    toast({
      title: "Food Selected",
      description: `${food.description} - Found ${vitamins.length} vitamin(s)`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = auth.currentUser

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add vitamins",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      await addDoc(collection(db, "vitamins"), {
        userId: user.uid,
        name: vitaminName,
        amount: Number.parseFloat(amount),
        unit,
        category,
        timestamp: new Date().toISOString(),
      })

      toast({ title: "Success", description: "Vitamin entry added successfully!" })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Save vitamin error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save vitamin entry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Vitamin Intake</CardTitle>
        <CardDescription>Enter details about your vitamin consumption</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vitaminName">Vitamin or Food Name</Label>
            <div className="flex gap-2">
              <Input
                id="vitaminName"
                type="text"
                placeholder="e.g., Vitamin D, Orange"
                value={vitaminName}
                onChange={(e) => setVitaminName(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleSearchUSDA} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "USDA"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use the USDA button to search the food database for vitamin content
            </p>
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
                      <div className="text-xs text-muted-foreground mt-1">{vitamins.length} vitamin(s) found</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg (milligrams)</SelectItem>
                  <SelectItem value="mcg">mcg (micrograms)</SelectItem>
                  <SelectItem value="g">g (grams)</SelectItem>
                  <SelectItem value="IU">IU (International Units)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fat-Soluble">Fat-Soluble Vitamin</SelectItem>
                <SelectItem value="Water-Soluble">Water-Soluble Vitamin</SelectItem>
                <SelectItem value="Mineral">Mineral</SelectItem>
                <SelectItem value="Supplement">Supplement</SelectItem>
                <SelectItem value="Food">Food Source</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Vitamin Entry"}
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
