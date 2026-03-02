"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5 watchlist items",
      "3 portfolio positions",
      "2 price alerts",
      "Basic charts",
      "Paper trading",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious traders",
    features: [
      "50 watchlist items",
      "100 portfolio positions",
      "20 price alerts",
      "Real-time data",
      "Advanced charts",
      "Paper trading",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "$49",
    period: "per month",
    description: "For professionals",
    features: [
      "Unlimited watchlist",
      "Unlimited positions",
      "Unlimited alerts",
      "Real-time data",
      "Advanced charts",
      "Paper trading",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
]

export function Pricing() {
  const router = useRouter()

  return (
    <section id="pricing" className="py-24 px-6 lg:px-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-border ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "hover:border-primary/50"
              } transition-all`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">
                    /{plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => router.push("/signup")}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


