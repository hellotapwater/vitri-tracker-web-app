import { SignupForm } from "@/components/signup-form"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">VitriTracker</h1>
          <p className="text-muted-foreground">Start your wellness journey today</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          {"Already have an account? "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
