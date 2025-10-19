import { Card } from "@/components/ui/card"
import { Plus, UtensilsCrossed, User, History } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Link href="/add-food">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-500">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <UtensilsCrossed className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Log Food</h3>
              <p className="text-sm text-muted-foreground">Track your meals</p>
            </div>
          </div>
        </Card>
      </Link>

      <Link href="/add-vitamin">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Add Vitamin</h3>
              <p className="text-sm text-muted-foreground">Log supplements</p>
            </div>
          </div>
        </Card>
      </Link>

      <Link href="/profile">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Profile</h3>
              <p className="text-sm text-muted-foreground">View settings</p>
            </div>
          </div>
        </Card>
      </Link>

      <Link href="/history">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <History className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">History</h3>
              <p className="text-sm text-muted-foreground">View past logs</p>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
