"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/server/better-auth/client";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Github,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gitHubLoading, setGitHubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (pwd: string) => {
    const newValidations = {
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    setValidations(newValidations);
    return Object.values(newValidations).every(Boolean);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("Password does not meet requirements");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Failed to sign up");
      } else if (result.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setGitHubLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sign up failed");
      setGitHubLoading(false);
    }
  };

  const passwordStrength = Object.values(validations).filter(Boolean).length;
  const passwordStrengthColor =
    passwordStrength <= 1 ? "red" : passwordStrength <= 3 ? "yellow" : "green";

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Branding */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Stock Portfolio
          </h1>
          <p className="text-gray-400">
            Create your account and start investing
          </p>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Get Started</CardTitle>
            <CardDescription>Create your account in seconds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Message */}
            {success && (
              <Alert className="border-green-600 bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="ml-2 text-green-400">
                  Account created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="border-gray-600 bg-gray-700/50 pl-10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="border-gray-600 bg-gray-700/50 pl-10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    disabled={loading}
                    className="border-gray-600 bg-gray-700/50 pr-10 pl-10 text-white placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition hover:text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Password strength</span>
                      <span className="font-semibold">
                        {passwordStrength}/5
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-700">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          passwordStrengthColor === "red"
                            ? "bg-red-500"
                            : passwordStrengthColor === "yellow"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1 text-xs">
                      <div
                        className={`flex items-center gap-2 ${validations.minLength ? "text-green-400" : "text-gray-500"}`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${validations.minLength ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-2 ${validations.hasUpperCase ? "text-green-400" : "text-gray-500"}`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${validations.hasUpperCase ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 ${validations.hasLowerCase ? "text-green-400" : "text-gray-500"}`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${validations.hasLowerCase ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 ${validations.hasNumber ? "text-green-400" : "text-gray-500"}`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${validations.hasNumber ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-2 ${validations.hasSpecialChar ? "text-green-400" : "text-gray-500"}`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${validations.hasSpecialChar ? "bg-green-400" : "bg-gray-600"}`}
                        />
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className={`border-gray-600 bg-gray-700/50 pr-10 pl-10 text-white placeholder:text-gray-500 ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition hover:text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={loading || !Object.values(validations).every(Boolean)}
                className="w-full bg-blue-600 py-6 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-800/50 px-2 text-gray-400">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* GitHub Sign Up */}
            <Button
              type="button"
              variant="outline"
              disabled={gitHubLoading || loading}
              onClick={handleGitHubSignUp}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {gitHubLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Sign up with GitHub
                </>
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="transition hover:text-gray-400">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="transition hover:text-gray-400">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
