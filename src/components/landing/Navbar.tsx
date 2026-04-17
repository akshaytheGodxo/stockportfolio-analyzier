"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { Menu, X, TrendingUp, User, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
];

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Get session using Better-Auth
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const result = await authClient.getSession();
        return result.data;
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setSignOutLoading(false);
    }
  };

  const isAuthenticated = !!session?.user;

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 border-border border-b shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-24">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="hover:text-primary flex items-center gap-2 text-2xl font-bold transition-colors"
          >
            <TrendingUp className="text-primary h-6 w-6" />
            <span>Pookie Wallet</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={signOutLoading}
                  className="flex items-center gap-2"
                >
                  {signOutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => router.push("/auth/signup")}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="hover:bg-accent rounded-md p-2 transition-colors md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-border animate-in slide-in-from-top-5 space-y-4 border-t py-4 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setIsMobileMenuOpen(false);
                }}
                className="text-muted-foreground hover:text-primary block px-4 py-2 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-border mt-4 space-y-2 border-t pt-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push("/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={signOutLoading}
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {signOutLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push("/auth/signin");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      router.push("/auth/signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
