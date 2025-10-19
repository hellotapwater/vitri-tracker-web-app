import { collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"

// User Profile Types
export interface UserProfile {
  userId: string
  email: string
  name: string
  age: number
  weight: number // in kg
  height: number // in cm
  gender: "male" | "female" | "other"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active"
  dietType: "omnivore" | "vegetarian" | "vegan"
  healthGoals: string[]
  createdAt: string
  onboardingComplete: boolean
}

// Vitamin Tablet Types
export interface VitaminTablet {
  id?: string
  userId: string
  name: string
  brand: string
  nutrients: {
    vitaminA?: number // mcg
    vitaminC?: number // mg
    vitaminD?: number // mcg
    vitaminE?: number // mg
    vitaminK?: number // mcg
    vitaminB1?: number // mg
    vitaminB2?: number // mg
    vitaminB3?: number // mg
    vitaminB6?: number // mg
    vitaminB12?: number // mcg
    folate?: number // mcg
    calcium?: number // mg
    iron?: number // mg
    magnesium?: number // mg
    zinc?: number // mg
    [key: string]: any
  }
  servingSize: string
  createdAt: string
}

// Food Log Entry Types
export interface FoodLogEntry {
  id?: string
  userId: string
  foodName: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  nutrients: {
    [key: string]: number
  }
  timestamp: string
  date: string // YYYY-MM-DD format
}

// Daily Recommendations Types
export interface DailyRecommendations {
  userId: string
  vitaminA: number // mcg
  vitaminC: number // mg
  vitaminD: number // mcg
  vitaminE: number // mg
  vitaminK: number // mcg
  vitaminB1: number // mg
  vitaminB2: number // mg
  vitaminB3: number // mg
  vitaminB6: number // mg
  vitaminB12: number // mcg
  folate: number // mcg
  calcium: number // mg
  iron: number // mg
  magnesium: number // mg
  zinc: number // mg
  calculatedAt: string
}

// Helper Functions
export async function createUserProfile(profile: UserProfile) {
  return await addDoc(collection(db, "users"), profile)
}

export async function addVitaminTablet(tablet: VitaminTablet) {
  return await addDoc(collection(db, "userTablets"), tablet)
}

export async function addFoodLogEntry(entry: FoodLogEntry) {
  return await addDoc(collection(db, "foodLog"), entry)
}

export async function getUserTablets(userId: string): Promise<VitaminTablet[]> {
  const q = query(collection(db, "userTablets"), where("userId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as VitaminTablet)
}

export async function getTodaysFoodLog(userId: string): Promise<FoodLogEntry[]> {
  const today = new Date().toISOString().split("T")[0]
  const q = query(
    collection(db, "foodLog"),
    where("userId", "==", userId),
    where("date", "==", today),
    orderBy("timestamp", "desc"),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FoodLogEntry)
}

export async function getRecentFoodLog(userId: string, days = 7): Promise<FoodLogEntry[]> {
  const q = query(
    collection(db, "foodLog"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(days * 5),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FoodLogEntry)
}
