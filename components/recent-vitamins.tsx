import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RecentVitamins() {
  // TODO: Fetch real data from Firebase
  const recentEntries = [
    { id: 1, name: "Vitamin D", amount: "1000 IU", time: "2 hours ago", category: "Fat-Soluble" },
    { id: 2, name: "Vitamin C", amount: "500 mg", time: "5 hours ago", category: "Water-Soluble" },
    { id: 3, name: "Calcium", amount: "600 mg", time: "1 day ago", category: "Mineral" },
    { id: 4, name: "B12", amount: "100 mcg", time: "1 day ago", category: "Water-Soluble" },
    { id: 5, name: "Iron", amount: "18 mg", time: "2 days ago", category: "Mineral" },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Fat-Soluble":
        return "bg-primary/10 text-primary"
      case "Water-Soluble":
        return "bg-accent/10 text-accent"
      case "Mineral":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
        <CardDescription>Your latest vitamin logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold">{entry.name}</h4>
                  <Badge variant="secondary" className={getCategoryColor(entry.category)}>
                    {entry.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{entry.time}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{entry.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
