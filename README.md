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
