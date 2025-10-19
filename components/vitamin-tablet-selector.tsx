"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Search, X } from "lucide-react"
import type { VitaminTablet } from "@/lib/firebase-helpers"
import { searchFoods, extractVitaminContent, type USDAFood } from "@/lib/usda-api"

interface VitaminTabletSelectorProps {
  tablets: VitaminTablet[]
  onTabletsChange: (tablets: VitaminTablet[]) => void
}

export function VitaminTabletSelector({ tablets, onTabletsChange }: VitaminTabletSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<USDAFood[]>([])
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery) {
      toast({ title: "Error", description: "Please enter a search term", variant: "destructive" })
      return
    }

    setIsSearching(true)
    setShowResults(false)

    try {
      const results = await searchFoods(searchQuery + " vitamin supplement")
      setSearchResults(results)
      setShowResults(true)

      if (results.length === 0) {
        toast({ title: "No Results", description: "Try a different search term" })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({ title: "Error", description: "Failed to search USDA database", variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectFood = (food: USDAFood) => {
    if (tablets.length >= 3) {
      toast({ title: "Limit Reached", description: "You can only add up to 3 tablets", variant: "destructive" })
      return
    }

    const vitamins = extractVitaminContent(food)
    const nutrients: any = {}

    vitamins.forEach((vitamin) => {
      const nutrientKey = vitamin.nutrientName.toLowerCase().replace(/[^a-z0-9]/g, "")
      nutrients[nutrientKey] = vitamin.value
    })

    const newTablet: VitaminTablet = {
      userId: "",
      name: food.description,
      brand: food.brandName || "Generic",
      nutrients,
      servingSize: "1 tablet",
      createdAt: new Date().toISOString(),
    }

    onTabletsChange([...tablets, newTablet])
    setShowResults(false)
    setSearchQuery("")

    toast({ title: "Tablet Added", description: `${food.description} added successfully` })
  }

  const handleRemoveTablet = (index: number) => {
    const newTablets = tablets.filter((_, i) => i !== index)
    onTabletsChange(newTablets)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for vitamin tablets (e.g., Multivitamin, Vitamin D)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {showResults && searchResults.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map((food) => {
                const vitamins = extractVitaminContent(food)
                return (
                  <button
                    key={food.fdcId}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left p-4 hover:bg-muted transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium">{food.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {food.brandName && <span className="mr-2">{food.brandName}</span>}
                      <span>{vitamins.length} nutrients found</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Label>Selected Tablets ({tablets.length}/3)</Label>
        {tablets.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tablets added yet. Search and add your vitamin tablets above.
          </p>
        )}
        {tablets.map((tablet, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{tablet.name}</h4>
                  <p className="text-sm text-muted-foreground">{tablet.brand}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(tablet.nutrients).map(([key, value]) => (
                      <span key={key} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveTablet(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
