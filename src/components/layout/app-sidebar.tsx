"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Star,
  Wallet,
  Bell,
  Settings,
  TrendingUp,
  TrainFront,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Market Overview", icon: LayoutDashboard },
  { href: "/dashboard/search", label: "Search Stocks", icon: Search },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },

  { href: "/dashboard/askai", label: "Ask AI", icon: TrainFront },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-card sticky top-0 h-screen w-64 overflow-y-auto border-r">
      <div className="p-6">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2">
          <TrendingUp className="text-primary h-6 w-6" />
          <span className="text-xl font-bold">Pookie Wallet</span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
