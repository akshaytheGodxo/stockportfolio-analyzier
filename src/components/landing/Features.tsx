"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, Bell, Wallet, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time Market Data",
    description: "Get live stock prices, charts, and market insights to make informed decisions.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep dive into technical indicators, patterns, and performance metrics.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Set price alerts and notifications to never miss important market movements.",
  },
  {
    icon: Wallet,
    title: "Paper Trading",
    description: "Practice trading with virtual money in a risk-free environment.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Ultra-fast data updates and seamless user experience.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and secure. We never share your information.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6 lg:px-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to track, analyze, and trade stocks like a pro.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
