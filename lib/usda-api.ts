export interface USDAFood {
  fdcId: number
  description: string
  foodNutrients: Array<{
    nutrientName: string
    value: number
    unitName: string
  }>
}

export async function searchFoods(query: string): Promise<USDAFood[]> {
  try {
    const response = await fetch(`/api/usda/search?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error("Failed to search foods")
    }

    const data = await response.json()
    return data.foods || []
  } catch (error) {
    console.error("[v0] USDA API search error:", error)
    throw error
  }
}

export function extractVitaminContent(foodData: USDAFood) {
  const nutrients = foodData.foodNutrients || []
  return nutrients.filter(
    (n) =>
      n.nutrientName.toLowerCase().includes("vitamin") ||
      n.nutrientName.toLowerCase().includes("calcium") ||
      n.nutrientName.toLowerCase().includes("iron") ||
      n.nutrientName.toLowerCase().includes("zinc") ||
      n.nutrientName.toLowerCase().includes("magnesium"),
  )
}
