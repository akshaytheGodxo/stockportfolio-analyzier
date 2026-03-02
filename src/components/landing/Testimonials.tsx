"use client"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Day Trader",
    content: "Pookie Wallet has transformed how I track stocks. The real-time alerts and clean interface make it indispensable.",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Portfolio Manager",
    content: "The paper trading feature helped me test strategies risk-free. Now I'm more confident with my real investments.",
    rating: 5,
  },
  {
    name: "Emily Johnson",
    role: "Beginner Investor",
    content: "As someone new to stocks, this platform made learning so much easier. The analytics are clear and actionable.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-6 lg:px-24 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of traders who trust Pookie Wallet for their market analysis.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border">
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  {testimonial.content}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


