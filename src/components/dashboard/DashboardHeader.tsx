"use client"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Crown, Sparkles } from "lucide-react"

export function DashboardHeader() {
  const { user } = useUser()
  const router = useRouter()
  // Mock subscription tier - replace with real data later
  const subscriptionTier = "free" as string// "free" | "pro" | "premium"

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {subscriptionTier !== "free" && (
            <Badge variant="secondary" className="gap-1">
              {subscriptionTier === "premium" ? (
                <Crown className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
          </span>
          {subscriptionTier === "free" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/settings?tab=subscription")}
            >
              Upgrade
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
