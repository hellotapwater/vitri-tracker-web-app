import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, Target, Calendar } from "lucide-react"

export function VitaminStats() {
  // TODO: Fetch real data from Firebase
  const stats = [
    {
      title: "Daily Goal",
      value: "75%",
      description: "Vitamins logged today",
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Weekly Streak",
      value: "5 days",
      description: "Keep it up!",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Total Vitamins",
      value: "12",
      description: "Tracked this month",
      icon: Activity,
      color: "text-emerald-600",
    },
    {
      title: "Last Entry",
      value: "2h ago",
      description: "Vitamin D",
      icon: Calendar,
      color: "text-blue-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
