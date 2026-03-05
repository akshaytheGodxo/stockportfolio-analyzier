"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Search, TrendingUp, CheckCircle2 } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Sign Up Free",
    description: "Create your account in seconds. No credit card required.",
  },
  {
    step: 2,
    icon: Search,
    title: "Explore Markets",
    description: "Search and discover stocks, view real-time prices and charts.",
  },
  {
    step: 3,
    icon: TrendingUp,
    title: "Build Your Portfolio",
    description: "Add stocks to your watchlist and start paper trading.",
  },
  {
    step: 4,
    icon: CheckCircle2,
    title: "Track & Analyze",
    description: "Monitor your positions, set alerts, and analyze performance.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-24 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes and start making smarter investment decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative">
                <Card className="border-border h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border transform -translate-y-1/2 z-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
