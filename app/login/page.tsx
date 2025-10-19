import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">VitriTracker</h1>
          <p className="text-muted-foreground">Track your vitamins, optimize your health</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          {"Don't have an account? "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
