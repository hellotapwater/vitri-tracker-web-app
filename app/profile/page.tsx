"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import type { UserProfile, VitaminTablet } from "@/lib/firebase-helpers"
import { User, Pill, LogOut, Save } from "lucide-react"
import { signOut } from "firebase/auth"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tablets, setTablets] = useState<VitaminTablet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        router.push("/login")
        return
      }

      const profileDoc = await getDoc(doc(db, "users", user.uid))
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as UserProfile)
      }

      const tabletsQuery = query(collection(db, "userTablets"), where("userId", "==", user.uid))
      const tabletsSnapshot = await getDocs(tabletsQuery)
      const tabletsData = tabletsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as VitaminTablet)
      setTablets(tabletsData)
    } catch (error) {
      console.error("Load profile error:", error)
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const user = auth.currentUser
      if (!user) return

      await updateDoc(doc(db, "users", user.uid), {
        name: profile.name,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        dietType: profile.dietType,
      })

      toast({ title: "Success", description: "Profile updated successfully!" })
    } catch (error: any) {
      console.error("Save profile error:", error)
      toast({ title: "Error", description: error.message || "Failed to save profile", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({ title: "Success", description: "Logged out successfully" })
      router.push("/login")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to logout", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-balance mb-2">Your Profile</h2>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value: any) => setProfile({ ...profile, gender: value })}
                  >
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
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: Number.parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={profile.activityLevel}
                  onValueChange={(value: any) => setProfile({ ...profile, activityLevel: value })}
                >
                  <SelectTrigger id="activityLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very-active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietType">Diet Type</Label>
                <Select
                  value={profile.dietType}
                  onValueChange={(value: any) => setProfile({ ...profile, dietType: value })}
                >
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

              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                Your Vitamin Tablets
              </CardTitle>
              <CardDescription>Supplements you're currently taking</CardDescription>
            </CardHeader>
            <CardContent>
              {tablets.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No tablets added yet</p>
              ) : (
                <div className="space-y-3">
                  {tablets.map((tablet) => (
                    <div key={tablet.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{tablet.name}</h4>
                      <p className="text-sm text-muted-foreground">{tablet.brand}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(tablet.nutrients).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
