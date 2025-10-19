import { type NextRequest, NextResponse } from "next/server"

const USDA_API_KEY = process.env.USDA_API_KEY
const BASE_URL = "https://api.nal.usda.gov/fdc/v1"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  if (!USDA_API_KEY) {
    return NextResponse.json({ error: "USDA API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("Failed to search foods")
    }

    const data = await response.json()
    return NextResponse.json({ foods: data.foods || [] })
  } catch (error) {
    console.error("USDA API search error:", error)
    return NextResponse.json({ error: "Failed to search USDA database" }, { status: 500 })
  }
}
