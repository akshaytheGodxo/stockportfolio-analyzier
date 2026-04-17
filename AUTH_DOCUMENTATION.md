# Authentication System Documentation

## Overview

The Stock Portfolio Analyzer uses **Better-Auth** for secure authentication with the following features:

- ✅ Email/Password authentication
- ✅ GitHub OAuth integration
- ✅ Session management with HTTP-only cookies
- ✅ Protected routes with middleware
- ✅ Type-safe authentication hooks

## Pages & Routes

### Sign In Page

- **Route**: `/auth/signin`
- **Features**:
  - Email & password login
  - GitHub OAuth sign in
  - Password visibility toggle
  - Forgot password link (to be implemented)
  - Form validation
  - Error handling with user feedback

### Sign Up Page

- **Route**: `/auth/signup`
- **Features**:
  - User registration with email/password
  - GitHub OAuth sign up
  - Name, email, password confirmation inputs
  - Real-time password strength indicator
  - Password requirements validation (8+ chars, uppercase, lowercase, number, special char)
  - Email validation
  - Success message with redirect

### Landing Page

- **Route**: `/`
- **Features**:
  - Navbar with dynamic auth buttons
  - Shows "Dashboard" & "Sign Out" for logged-in users
  - Shows "Sign In" & "Get Started" for logged-out users
  - Mobile responsive menu

### Dashboard

- **Route**: `/dashboard`
- **Protection**: Requires authentication
- **Middleware**: Automatically redirects unauthenticated users to `/auth/signin`

## Authentication Flow

### Sign In Flow

```
1. User navigates to /auth/signin
2. Enters email and password
3. Click "Sign In" button
4. Client calls authClient.signIn.email()
5. Better-Auth validates credentials
6. If valid: Creates session cookie and redirects to /dashboard
7. If invalid: Shows error message
```

### Sign Up Flow

```
1. User navigates to /auth/signup
2. Enters name, email, password, and confirms password
3. Client-side validation checks:
   - All fields filled
   - Passwords match
   - Password meets requirements
   - Valid email format
4. Click "Create Account" button
5. Client calls authClient.signUp.email()
6. Better-Auth creates user and session
7. If valid: Redirects to /dashboard
8. If invalid: Shows specific error message
```

### GitHub OAuth Flow

```
1. User clicks "Sign in with GitHub" button
2. Client calls authClient.signIn.social({ provider: "github" })
3. Redirects to GitHub OAuth page
4. User authorizes the app
5. GitHub redirects back with auth code
6. Better-Auth validates and creates session
7. User redirected to /dashboard
```

## Usage

### Using the Session Hook

```tsx
import { useSession } from "@/hooks/use-auth-session";

export function ProfilePage() {
  const { session, isLoading, isAuthenticated, user } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return <div>Hello {user?.name}</div>;
}
```

### Protecting Routes

Option 1: Using the middleware (server-side)

- Automatically redirects to `/auth/signin` if not authenticated
- Checks for `better-auth.session_token` cookie

Option 2: Using ProtectedRoute component

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Dashboard content</div>
    </ProtectedRoute>
  );
}
```

### Sign Out

```tsx
import { authClient } from "@/server/better-auth/client";

async function handleSignOut() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/");
      },
    },
  });
}
```

## Security Features

1. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies
2. **CSRF Protection**: Built-in CSRF protection via Better-Auth
3. **Password Hashing**: Passwords hashed with bcrypt
4. **Session Validation**: Server validates session on protected routes
5. **Middleware Protection**: Automatic redirect for unauthorized access

## Configuration

### Environment Variables

Required `.env` variables:

```
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_BASE_URL=http://localhost:3000
BETTER_AUTH_GITHUB_CLIENT_ID=your_github_client_id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
DATABASE_URL=your_postgres_url
```

### Better-Auth Config

Located in: `src/server/better-auth/config.ts`

Features enabled:

- Email & Password: ✅ Enabled
- GitHub OAuth: ✅ Configured
- Prisma Adapter: ✅ PostgreSQL
- NextJS Cookies: ✅ Enabled

## Database Models

Better-Auth uses these Prisma models (auto-managed):

- `User`: User account information
- `Session`: Active user sessions
- `Account`: OAuth provider connections
- `Verification`: Email verification tokens

## Error Handling

### Common Errors

| Error                    | Cause                      | Solution                       |
| ------------------------ | -------------------------- | ------------------------------ |
| "Invalid credentials"    | Wrong email or password    | Check email/password           |
| "User already exists"    | Email already registered   | Use different email or sign in |
| "Password too weak"      | Doesn't meet requirements  | Use stronger password          |
| "Passwords do not match" | Confirmation doesn't match | Ensure passwords match         |
| "Invalid email"          | Email format incorrect     | Use valid email format         |

## Testing

### Test Credentials (Development)

Create test accounts via the sign-up page. No pre-created test accounts.

### GitHub OAuth (Development)

1. Must use GitHub account with configured OAuth app
2. Configured redirect URL: `http://localhost:3000/api/auth/callback/github`

## Next Steps / TODO

- [ ] Implement "Forgot Password" functionality
- [ ] Add email verification on signup
- [ ] Implement email change verification
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Add social provider linking
- [ ] Add account deletion
- [ ] Add session management (view active sessions)
- [ ] Add password reset token expiration

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── layout.tsx
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts
├── middleware.ts
├── hooks/
│   └── use-auth-session.ts
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx
└── server/
    └── better-auth/
        ├── config.ts
        ├── client.ts
        └── index.ts
```

## Support

For issues or questions:

1. Check the error message provided
2. Verify environment variables are set correctly
3. Check database connection
4. Review Better-Auth documentation: https://better-auth.com
