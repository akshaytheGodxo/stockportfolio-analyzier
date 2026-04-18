/**
 * Authentication Quick Reference Guide
 *
 * This file provides quick snippets and patterns for common authentication tasks
 */

// ============================================================================
// 1. CHECK IF USER IS AUTHENTICATED
// ============================================================================

import { useSession } from "@/hooks/use-auth-session";

function MyComponent() {
  const { isAuthenticated, user, isLoading } = useSession();

  if (isLoading) return <p>Loading...</p>;
  return isAuthenticated ? <p>Welcome {user?.name}</p> : <p>Please sign in</p>;
}

// ============================================================================
// 2. PROTECT A ROUTE/COMPONENT
// ============================================================================

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Only authenticated users see this</div>
    </ProtectedRoute>
  );
}

// ============================================================================
// 3. GET CURRENT USER IN SERVER COMPONENT
// ============================================================================

// Import at top of server component
import { auth } from "@/server/better-auth";

async function ServerComponent() {
  const session = await auth.api.getSession();

  if (!session) return <p>Not authenticated</p>;

  return <div>Welcome {session.user.name}</div>;
}

// ============================================================================
// 4. SIGN OUT PROGRAMMATICALLY
// ============================================================================

import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return <button onClick={handleLogout}>Log out</button>;
}

// ============================================================================
// 5. VALIDATE PASSWORD ON SIGNUP
// ============================================================================

function validatePassword(password: string) {
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isValid = Object.values(validations).every(Boolean);
  return { isValid, validations };
}

// Usage
const pwd = "MyPassword123!";
const { isValid, validations } = validatePassword(pwd);
if (!isValid) console.log("Password doesn't meet requirements:", validations);

// ============================================================================
// 6. HANDLE AUTHENTICATION ERRORS
// ============================================================================

async function attemptSignIn(email: string, password: string) {
  try {
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      // Handle specific errors
      switch (result.error.message) {
        case "Invalid credentials":
          console.error("Email or password incorrect");
          break;
        case "User not found":
          console.error("No account with this email");
          break;
        default:
          console.error(result.error.message);
      }
    } else if (result.data) {
      console.log("Sign in successful!");
      // Redirect handled by callbackURL
    }
  } catch (error) {
    console.error("Sign in error:", error);
  }
}

// ============================================================================
// 7. USE SESSION IN TRPC PROCEDURE
// ============================================================================

import { protectedProcedure } from "@/server/api/trpc";

// The session is automatically available in ctx
const myProtectedProcedure = protectedProcedure.query(({ ctx }) => {
  console.log("User ID:", ctx.session.user.id);
  console.log("User email:", ctx.session.user.email);
  return {
    message: `Hello ${ctx.session.user.name}`,
  };
});

// ============================================================================
// 8. MIDDLEWARE EXPLANATION
// ============================================================================

/**
 * The middleware at src/middleware.ts:
 *
 * 1. Protects routes starting with /dashboard (requires auth)
 * 2. Redirects authenticated users away from /auth/* pages
 * 3. Checks for 'better-auth.session_token' cookie
 *
 * How it works:
 * - User without auth accessing /dashboard → redirect to /auth/signin
 * - User with auth accessing /auth/signin → redirect to /dashboard
 */

// ============================================================================
// 9. ENVIRONMENT VARIABLES NEEDED
// ============================================================================

/*
BETTER_AUTH_SECRET=<secret_key>
BETTER_AUTH_BASE_URL=http://localhost:3000
BETTER_AUTH_GITHUB_CLIENT_ID=<github_client_id>
BETTER_AUTH_GITHUB_CLIENT_SECRET=<github_client_secret>
DATABASE_URL=postgresql://user:pass@localhost:5432/db_name
*/

// ============================================================================
// 10. COMMON PATTERNS
// ============================================================================

// Pattern 1: Conditional Navigation
function NavigationBar() {
  const { isAuthenticated } = useSession();

  return (
    <nav>
      <NavLink href="/">Home</NavLink>
      {isAuthenticated ? (
        <>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <LogoutButton />
        </>
      ) : (
        <>
          <NavLink href="/auth/signin">Sign In</NavLink>
          <NavLink href="/auth/signup">Sign Up</NavLink>
        </>
      )}
    </nav>
  );
}

// Pattern 2: Auto-redirect After Sign In
// (Already built-in with callbackURL parameter)

// Pattern 3: Persist Session Across Page Reloads
// (Handled by Better-Auth with HTTP-only cookies)

// Pattern 4: Display User Info
function UserProfile() {
  const { user, isLoading } = useSession();

  if (isLoading) return <p>Loading profile...</p>;

  return (
    <div>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Joined: {new Date(user?.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

// ============================================================================
// USEFUL LINKS
// ============================================================================

/*
- Sign In: http://localhost:3000/auth/signin
- Sign Up: http://localhost:3000/auth/signup
- Dashboard: http://localhost:3000/dashboard
- Home: http://localhost:3000/

Better-Auth Docs: https://better-auth.com
Better-Auth GitHub: https://github.com/better-auth/better-auth
*/
