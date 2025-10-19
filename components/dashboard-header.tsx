"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function DashboardHeader() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    // TODO: Implement Firebase logout
    // import { signOut } from 'firebase/auth'
    // import { auth } from '@/lib/firebase'
    // await signOut(auth)

    toast({ title: "Logged out", description: "You have been logged out successfully" })
    router.push("/login")
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">VitriTracker</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/add-vitamin" className="text-sm font-medium hover:text-primary transition-colors">
              Add Vitamin
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
