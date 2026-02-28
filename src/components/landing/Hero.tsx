// Hero.tsx
"use client"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { TrendingUp, BarChart3, Zap, Shield, ArrowRight } from "lucide-react"
import { motion } from "motion/react"

const features = [
  { icon: TrendingUp, text: "Real-time Market Data" },
  { icon: BarChart3, text: "Advanced Analytics" },
  { icon: Zap, text: "Lightning Fast" },
  { icon: Shield, text: "Secure & Private" },
]

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container relative z-10 px-6 lg:px-24 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Trusted by thousands of traders
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Master the Markets
            </span>
            <br />
            <span className="text-foreground">Like a Pro</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
          >
            Track stocks, analyze trends, and practice trading with paper money.
            Build your portfolio, set alerts, and make smarter investment decisions—all in one powerful platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 group"
              onClick={() => router.push("/signup")}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => router.push("/dashboard")}
            >
              View Dashboard
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature.text}</span>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* Visual element - Stock chart mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-2xl">
            {/* Chart header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-2xl font-bold mb-1">AAPL</div>
                <div className="text-sm text-muted-foreground">Apple Inc.</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">$175.43</div>
                <div className="text-sm text-green-500">+1.35%</div>
              </div>
            </div>

            {/* Mock chart */}
            <div className="relative h-64 bg-gradient-to-t from-primary/10 to-transparent rounded-lg overflow-hidden">
              <svg
                viewBox="0 0 400 200"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,150 Q 50,120 100,100 T 200,80 T 300,60 T 400,40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
                <path
                  d="M 0,150 Q 50,120 100,100 T 200,80 T 300,60 T 400,40 L 400,200 L 0,200 Z"
                  fill="url(#chartGradient)"
                  className="text-primary"
                />
              </svg>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Volume", value: "45.2M" },
                { label: "Market Cap", value: "$2.8T" },
                { label: "52W High", value: "$198.23" },
              ].map((stat, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-sm font-semibold">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
