import type { UserProfile, DailyRecommendations, FoodLogEntry, VitaminTablet } from "./firebase-helpers"

// RDA (Recommended Dietary Allowance) based on age, gender, and activity level
export function calculateDailyNeeds(profile: UserProfile): DailyRecommendations {
  const { age, gender, activityLevel, weight } = profile

  // Base RDA values (adult male, moderate activity)
  const recommendations: DailyRecommendations = {
    userId: profile.userId,
    vitaminA: 900, // mcg
    vitaminC: 90, // mg
    vitaminD: 15, // mcg
    vitaminE: 15, // mg
    vitaminK: 120, // mcg
    vitaminB1: 1.2, // mg
    vitaminB2: 1.3, // mg
    vitaminB3: 16, // mg
    vitaminB6: 1.3, // mg
    vitaminB12: 2.4, // mcg
    folate: 400, // mcg
    calcium: 1000, // mg
    iron: 8, // mg
    magnesium: 400, // mg
    zinc: 11, // mg
    calculatedAt: new Date().toISOString(),
  }

  // Adjust for gender
  if (gender === "female") {
    recommendations.vitaminA = 700
    recommendations.vitaminC = 75
    recommendations.vitaminK = 90
    recommendations.vitaminB1 = 1.1
    recommendations.vitaminB2 = 1.1
    recommendations.vitaminB3 = 14
    recommendations.iron = 18 // Higher for women
    recommendations.magnesium = 310
    recommendations.zinc = 8
  }

  // Adjust for age
  if (age > 50) {
    recommendations.vitaminD = 20 // Higher for older adults
    recommendations.vitaminB6 = gender === "male" ? 1.7 : 1.5
    recommendations.vitaminB12 = 2.4
    recommendations.calcium = 1200 // Higher for older adults
  }

  // Adjust for activity level
  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.3,
    "very-active": 1.4,
  }

  const multiplier = activityMultipliers[activityLevel]

  // Apply activity multiplier to B vitamins and minerals (energy metabolism)
  recommendations.vitaminB1 *= multiplier
  recommendations.vitaminB2 *= multiplier
  recommendations.vitaminB3 *= multiplier
  recommendations.vitaminB6 *= multiplier
  recommendations.magnesium *= multiplier
  recommendations.zinc *= multiplier

  return recommendations
}

// Calculate total nutrients consumed today from food log
export function calculateConsumedNutrients(foodLog: FoodLogEntry[]): { [key: string]: number } {
  const totals: { [key: string]: number } = {}

  foodLog.forEach((entry) => {
    Object.entries(entry.nutrients).forEach(([nutrient, value]) => {
      totals[nutrient] = (totals[nutrient] || 0) + value
    })
  })

  return totals
}

// Calculate remaining nutrients needed
export function calculateRemainingNeeds(
  recommendations: DailyRecommendations,
  consumed: { [key: string]: number },
): { [key: string]: number } {
  const remaining: { [key: string]: number } = {}

  Object.entries(recommendations).forEach(([nutrient, recommended]) => {
    if (nutrient === "userId" || nutrient === "calculatedAt") return

    const consumedAmount = consumed[nutrient] || 0
    remaining[nutrient] = Math.max(0, recommended - consumedAmount)
  })

  return remaining
}

// Calculate how many tablets to take based on remaining needs
export function calculateTabletRecommendations(
  remaining: { [key: string]: number },
  tablets: VitaminTablet[],
): { tablet: VitaminTablet; servings: number; nutrients: string[] }[] {
  const recommendations: { tablet: VitaminTablet; servings: number; nutrients: string[] }[] = []

  tablets.forEach((tablet) => {
    const deficientNutrients: string[] = []
    let maxServingsNeeded = 0

    Object.entries(tablet.nutrients).forEach(([nutrient, amountPerServing]) => {
      if (!amountPerServing) return

      const needed = remaining[nutrient]
      if (needed && needed > 0) {
        deficientNutrients.push(nutrient)
        const servingsForThisNutrient = Math.ceil(needed / amountPerServing)
        maxServingsNeeded = Math.max(maxServingsNeeded, servingsForThisNutrient)
      }
    })

    if (deficientNutrients.length > 0) {
      recommendations.push({
        tablet,
        servings: Math.min(maxServingsNeeded, 2), // Cap at 2 servings for safety
        nutrients: deficientNutrients,
      })
    }
  })

  return recommendations
}

// Get percentage of daily value consumed
export function getPercentageConsumed(consumed: number, recommended: number): number {
  return Math.round((consumed / recommended) * 100)
}

// Format nutrient name for display
export function formatNutrientName(nutrient: string): string {
  const names: { [key: string]: string } = {
    vitaminA: "Vitamin A",
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    vitaminE: "Vitamin E",
    vitaminK: "Vitamin K",
    vitaminB1: "Vitamin B1 (Thiamin)",
    vitaminB2: "Vitamin B2 (Riboflavin)",
    vitaminB3: "Vitamin B3 (Niacin)",
    vitaminB6: "Vitamin B6",
    vitaminB12: "Vitamin B12",
    folate: "Folate",
    calcium: "Calcium",
    iron: "Iron",
    magnesium: "Magnesium",
    zinc: "Zinc",
  }
  return names[nutrient] || nutrient
}
