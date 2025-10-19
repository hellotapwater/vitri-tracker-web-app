"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import type { UserProfile } from "@/lib/firebase-helpers"
import { VitaminTabletSelector } from "@/components/vitamin-tablet-selector"
import type { VitaminTablet } from "@/lib/firebase-helpers"
import { ArrowRight, ArrowLeft } from "lucide-react"

export function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // User profile data
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other">("male")
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very-active">(
    "moderate",
  )
  const [dietType, setDietType] = useState<"omnivore" | "vegetarian" | "vegan">("omnivore")
  const [healthGoals, setHealthGoals] = useState<string[]>([])

  // Vitamin tablets
  const [selectedTablets, setSelectedTablets] = useState<VitaminTablet[]>([])

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step === 1) {
      if (!name || !age || !weight || !height) {
        toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
        return
      }
    }

    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      const user = auth.currentUser
      if (!user) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" })
        router.push("/login")
        return
      }

      // Save user profile
      const profile: UserProfile = {
        userId: user.uid,
        email: user.email || "",
        name,
        age: Number.parseInt(age),
        weight: Number.parseFloat(weight),
        height: Number.parseFloat(height),
        gender,
        activityLevel,
        dietType,
        healthGoals,
        createdAt: new Date().toISOString(),
        onboardingComplete: true,
      }

      await setDoc(doc(db, "users", user.uid), profile)

      // Save vitamin tablets
      for (const tablet of selectedTablets) {
        await setDoc(doc(db, "userTablets", `${user.uid}_${Date.now()}_${Math.random()}`), {
          ...tablet,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        })
      }

      toast({ title: "Success", description: "Profile created successfully!" })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Onboarding error:", error)
      toast({ title: "Error", description: error.message || "Failed to complete onboarding", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Welcome to VitriTracker</CardTitle>
        <CardDescription>Let's personalize your vitamin tracking experience</CardDescription>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {step} of {totalSteps}
        </p>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Lifestyle Information</h3>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={activityLevel} onValueChange={(value: any) => setActivityLevel(value)}>
                <SelectTrigger id="activityLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (intense exercise daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietType">Diet Type</Label>
              <Select value={dietType} onValueChange={(value: any) => setDietType(value)}>
                <SelectTrigger id="dietType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnivore">Omnivore</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Your Vitamin Tablets</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add up to 3 vitamin tablets or supplements you currently take
              </p>
            </div>

            <VitaminTabletSelector tablets={selectedTablets} onTabletsChange={setSelectedTablets} />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? "Completing..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
