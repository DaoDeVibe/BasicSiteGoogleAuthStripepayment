# Basic Website with Google Login and Stripe Payments

A general-purpose website starter with Google sign-in, persistent user accounts,
and Stripe subscription payments. It provides the basic account and billing
screens so developers can build their own application on top of them.

This repository is cloned from
[CrazyTrainAIAuthpay](https://github.com/ShareBrainWhatAgent/CrazyTrainAIAuthpay).
Its scope is the website, authentication, and payment foundation. A store can be
built in a separate clone; products, carts, inventory, and orders are not included
in this starter.

## Basic functionality

### Google login and user accounts

- A public landing page offers Google sign-in.
- The backend uses Passport's Google OAuth strategy to authenticate the user.
- Sign-in creates or updates a user record containing the Google user ID, email,
  name, and profile image.
- PostgreSQL-backed sessions retain the signed-in state between requests.
- Signed-in users can view their account information and subscription dashboard.
- A logout route ends the Passport login session.

The application requests Google's profile and email scopes. It does not implement
a separate password-registration or password-reset system.

### Stripe payments and subscription management

- A subscription page displays a Stripe Payment Element for entering payment
  details.
- The backend creates a Stripe customer when needed, then creates a recurring
  subscription and returns the payment client secret to the browser.
- The current example is a **Premium Plan at USD $1 per month**. This is the
  existing demo configuration, not a requirement for applications built from it.
- User records retain the Stripe customer ID, subscription ID, subscription
  status, and subscription end date.
- The dashboard retrieves the subscription's current status from Stripe and
  displays the next billing date when available.
- A Manage Subscription action opens Stripe's customer billing portal, subject
  to the portal settings configured in that Stripe account.

The current payment implementation is recurring subscription billing. It does
not include a product catalog, shopping cart, product-order checkout, marketplace
payouts, or a general one-time-payment API. The example also does not automatically
protect every future application feature with a paid-access check; developers
must enforce subscription access on their own protected backend routes.

## Typical user flow

1. Open the website and choose Google sign-in.
2. Complete Google's authentication flow.
3. Arrive at the account dashboard and see the current subscription status.
4. Choose Subscribe and enter payment details in Stripe's payment form.
5. Return to the dashboard and retrieve the updated subscription status.
6. Use Manage Subscription to open Stripe's billing portal, or log out.

This describes the intended implemented flow. Successful real Google login and
Stripe payments have not been verified for this clone during the documentation
review.

## Technology and project layout

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix/shadcn-style UI,
  Wouter routing, and TanStack Query.
- **Backend:** Node.js, Express, Passport, and express-session.
- **Data:** PostgreSQL, Drizzle ORM, the Neon serverless database driver, and
  connect-pg-simple for session storage.
- **Payments:** Stripe's server SDK, Stripe.js, and React Stripe Elements.

| Location | Purpose |
| --- | --- |
| `client/src/pages/landing.tsx` | Public landing page and Google sign-in entry |
| `client/src/pages/home.tsx` | Account and subscription dashboard |
| `client/src/pages/subscribe.tsx` | Stripe subscription payment form |
| `client/src/App.tsx` | Frontend routing and signed-in/signed-out views |
| `server/auth.ts` | Google OAuth, sessions, authentication, and logout |
| `server/routes.ts` | User, subscription, billing-portal, and health endpoints |
| `server/db.ts` | Database connection and Drizzle setup |
| `shared/schema.ts` | User and session database schema |

## Configuration

The current standalone code expects configuration for the operator's Google
OAuth application, Stripe account, database, and session signing.

| Variable | Use |
| --- | --- |
| `DATABASE_URL` | Compatible PostgreSQL/Neon connection for users and sessions |
| `SESSION_SECRET` | Private server-side session-signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Private Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Private server-side Stripe API key |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key included in the frontend build |
| `PORT` | Optional HTTP listening port; the server defaults to 5000 |
| `NODE_ENV` | Development or production runtime mode |

## Security maintenance

Use Node.js 22.22.1 or newer. Production requires `PUBLIC_URL` set to the exact
HTTPS website origin (for example `https://example.com`) and an independently
random `SESSION_SECRET` of at least 32 characters. Register
`PUBLIC_URL/auth/google/callback` with your own Google OAuth application.

The maintenance branch upgrades vulnerable locked dependencies, adds OAuth state
validation and verified Google email checks, uses secure production cookies, keeps
Google access/refresh tokens out of the application session, and blocks payment
writes without the exact website Origin. Logout has a confirmation page followed
by a same-origin POST. Billing return URLs come from configured PUBLIC_URL rather
than request Host headers. Stripe resource creation uses site/user-scoped retry
keys; the existing $1/month example remains unchanged. No real prices or charges
were created during maintenance.

API logs omit response bodies, and error responses omit internal details without
crashing the server. Unused Replit development plugins/banner and unused vulnerable
schema-helper dependencies were removed. No store features or DaoDeVibe-specific
managed services were added: this remains a standalone Google/Stripe template.

Checks: `npm ci --ignore-scripts`, `npm run check`, `npm test`, `npm run build`,
`npm audit --audit-level=high`. The November 2 maintenance audit reports zero high
or critical findings; moderate findings remain (primarily development tooling).
This is not an independent security certification. Build Brain's pinned scanner
must recheck the imported revision. Real Google callback, Stripe test-card flow,
subscription cancellation/retry/reconciliation and production deployment still
need operator acceptance. Future advisories can change the result.

### Protecting the public repository

Public visibility permits reading/cloning/forking, not writing. In GitHub Settings
→ Rules → Rulesets, create an active branch rule targeting `main`: require pull
requests, require the `Template security and build` status check after it has run,
block force pushes and deletion, and keep bypass access narrow. A solo maintainer
can require PRs without requiring an additional reviewer; add an independent
approval requirement when another trusted reviewer is available. Review repository
collaborators/teams, deploy keys and installed GitHub Apps for unnecessary write
permissions. Protecting main does not revoke an existing app's permissions.

The current integration could not inspect branch protection (GitHub returned403
for Administration access). These instructions are not evidence that rules were
installed. Do not disable CI to merge a failed dependency update.
