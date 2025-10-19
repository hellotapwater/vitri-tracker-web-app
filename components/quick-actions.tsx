import { Card } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Link href="/add-vitamin">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Add Vitamin</h3>
              <p className="text-sm text-muted-foreground">Log your daily intake</p>
            </div>
          </div>
        </Card>
      </Link>

      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Search className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Search Foods</h3>
            <p className="text-sm text-muted-foreground">Find vitamin content</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
