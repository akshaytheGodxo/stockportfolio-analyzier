// AUTHENTICATION ARCHITECTURE & FLOW DIAGRAMS

/\*
████████████████████████████████████████████████████████████████████████████████
AUTHENTICATION FLOW
████████████████████████████████████████████████████████████████████████████████

1. SIGN UP FLOW
   ═════════════════════════════════════════════════════════════════════════════

User SignUp Page Better-Auth Database
│ │ │ │
│─────── Visit /signup─────>│ │ │
│ │ │ │
│<──── Show sign up form───│ │ │
│ │ │ │
│─── Enter name/pwd ──────>│ │ │
│───────[Validate] ───────>│ │ │
│<─── Show strength bar ───│ │ │
│ │ │ │
│─────[Click Create] ──────>│─ signUp.email() ────────>│ │
│ │ (name, email, pwd) │ │
│ │ │─── Hash Password ─────>│
│ │ │ │
│ │ │─ Create User ─────────>│
│ │ │ │
│ │ │─ Create Session ──────>│
│ │ │ │
│ │<──────[Success]───────────│ │
│<──[Show success msg]─────│ │ │
│──────[Auto redirect]─────>│───────────────────────────────────────────────────>
│ Dashboard (Protected)
│

2. SIGN IN FLOW
   ═════════════════════════════════════════════════════════════════════════════

User SignIn Page Better-Auth Database
│ │ │ │
│──────── Visit /signin ───>│ │ │
│ │ │ │
│<──── Show login form ─────│ │ │
│ │ │ │
│─── Enter email/pwd ──────>│ │ │
│ │ │ │
│─────[Click Sign In] ──────>│─ signIn.email() ────────>│ │
│ │ (email, password) │ │
│ │ │─ Find User ───────────>│
│ │ │ │
│ │ │─ Compare Password ───>│
│ │ │ │
│ │ │─ Create|Update Session>│
│ │ │ │
│ │<──[Success + Cookie]──────│ │
│<───[HTTP-Only Cookie set]─│ │ │
│──────[Auto redirect]─────>│───────────────────────────────────────────────────>
│ Dashboard (Protected)
│

3. GITHUB OAUTH FLOW
   ═════════════════════════════════════════════════════════════════════════════

User GitHub Page Better-Auth Database
│ │ │ │
│─[Click GitHub btn]──>│ (Sign in Page) │ │
│ │ │ │
│ │ ────[OAuth URL]──────────>│ │
│ │ │ │
│ │<──[Redirect to GitHub]───│ │
│ │ │ │
│─────[Authorize]─────>│ │ │
│ │ │ │
│ │<──────[Auth Code]────────│ │
│ │ │ │
│ │ ──[Exchange Code]──────────────>│
│ │ ──[Get User Data]──────────────>│
│ │ │ │
│ │ │ ─── Create/Find User ──>│
│ │ │ │
│ │ │ ─── Create Session ───>│
│ │ │ │
│ │<──────[Success + Cookie]──── │
│<────[HTTP-Only Cookie set]──┴─────────────────────────────────────────────
│───────[Auto redirect]─────────────────────────────────────────────────────>
Dashboard (Protected)

4. PROTECTED ROUTE ACCESS
   ═════════════════════════════════════════════════════════════════════════════

User Middleware Dashboard
│ │ │
│──[Access /d]──>│ │
│ │ │
│ │ ─[Check Cookie]────────>DB
│ │ │
│ │<──[Valid Session]───────
│ │ │
│ │─────────[Allow]────────>│
│ │ │
│ │<──[Render Page]─────────│
│<──[Show Page]──│ │
│

OR

User Middleware SignIn Page
│ │ │
│──[Access /d]──>│ │
│ │ ─[Check Cookie]─────────>DB
│ │ │
│ │<──[No Session]──────────
│ │ │
│ │─────[Redirect]─────────>
│<──[SignIn Page]─┴─────────────────────────
│

════════════════════════════════════════════════════════════════════════════════
COMPONENT ARCHITECTURE
════════════════════════════════════════════════════════════════════════════════

App Routes Structure:
┌─────────────────────────────────────────────────────────────┐
│ / (Landing Page) │
│ ├─ Navbar (Dynamic Auth Buttons) │
│ │ ├─ Authenticated: [Dashboard] [Sign Out] │
│ │ └─ Unauthenticated: [Sign In] [Get Started] │
│ ├─ Hero │
│ ├─ Features │
│ ├─ Pricing │
│ └─ Footer │
└─────────────────────────────────────────────────────────────┘
↓ ↓
Sign In Get Started
/auth/signin /auth/signup
├─ Email Input ├─ Name Input
├─ Password Input ├─ Email Input
├─ Sign In Button ├─ Password Input
├─ GitHub OAuth ├─ Confirm Password
└─ Link to /signup ├─ Strength Indicator
├─ Sign Up Button
├─ GitHub OAuth
└─ Link to /signin

    Both auto-redirect to ↓

    /dashboard (PROTECTED)
    ├─ Middleware checks auth
    ├─ ProtectedRoute wrapper (optional)
    ├─ useSession() hook for user data
    └─ All dashboard pages

════════════════════════════════════════════════════════════════════════════════
SECURITY LAYERS
════════════════════════════════════════════════════════════════════════════════

Request → [Middleware] → [Protected Route] → [Server] → [Database]
↓ ↓ ↓ ↓ 1. Check 2. Validate 3. Verify 4. Permission
Cookie Session Role Check

           ✓ HTTP-only    ✓ Signature    ✓ User     ✓ DB Constraints
           ✓ Secure flag  ✓ Expiration   ✓ Role     ✓ RLS if enabled
           ✓ SameSite     ✓ CSRF Token   ✓ Perms

════════════════════════════════════════════════════════════════════════════════
STATE MANAGEMENT
════════════════════════════════════════════════════════════════════════════════

React Query (TanStack Query)
↓
useQuery: Session Data
↓
queryKey: ["session"]
↓
Cached for 5 minutes
↓
Automatically refetched on focus
↓
Available via useSession() hook

════════════════════════════════════════════════════════════════════════════════
FILE STRUCTURE
════════════════════════════════════════════════════════════════════════════════

src/
├── app/
│ ├── /auth
│ │ ├── /signin
│ │ │ └── page.tsx [Sign In UI & Logic]
│ │ ├── /signup
│ │ │ └── page.tsx [Sign Up UI & Logic & Validation]
│ │ └── layout.tsx [Auth Layout]
│ │
│ ├── /dashboard [Protected Routes - Middleware]
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ ├── /portfolio
│ │ ├── /watchlist
│ │ ├── /search
│ │ └── /trends
│ │
│ ├── /api/auth
│ │ └── [...all]/route.ts [Better-Auth Endpoint]
│ │
│ ├── page.tsx [Landing Page]
│ └── layout.tsx
│
├── server/
│ ├── better-auth/
│ │ ├── config.ts [Better-Auth Configuration]
│ │ ├── client.ts [Client-side Auth Client]
│ │ └── index.ts [Server Auth Instance]
│ │
│ └── api/
│ └── trpc.ts [Protected Procedures]
│
├── components/
│ ├── auth/
│ │ └── ProtectedRoute.tsx [Route Protection Wrapper]
│ │
│ └── landing/
│ └── Navbar.tsx [Updated with Auth]
│
├── hooks/
│ └── use-auth-session.ts [Session Hook]
│
└── middleware.ts [Route Protection Logic]

════════════════════════════════════════════════════════════════════════════════
\*/

// Quick Reference Tree
/\*
AUTHENTICATION SYSTEM
│
┌───────┼───────┐
│ │ │
Pages Hooks Security
│ │ │
├─ SignIn useSession() ├─ Middleware
├─ SignUp (useQuery) ├─ ProtectedRoute
└─ Landing └─ Protected Procedures
↓ ↓ ↓
Better-Auth API ← → PostgreSQL Database

Session Cookie (HTTP-only)
├─ Name: better-auth.session_token
├─ Secure: true
├─ SameSite: none
├─ HttpOnly: true
├─ Max-Age: 7 days
└─ Validated on every request
\*/
