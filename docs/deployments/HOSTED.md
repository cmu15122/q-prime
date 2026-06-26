# Hosted Deployment Guide (Convex Cloud + Vercel)

**Contact:** Please reach out to Jackson Romero (<jtromero@cmu.edu> or <jacksontromero@gmail.com>) for help with deployment or development on q'

This is the **easiest deployment option** - using Convex Cloud for the backend and Vercel for the frontend. Both services have generous free tiers and handle all infrastructure for you.

## Prerequisites

Before starting, you'll need:

- A [Convex](https://convex.dev) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [GitHub](https://github.com) account
- Google Cloud Console access for OAuth credentials

## Step 1: Fork the Repository

1. Go to [github.com/cmu15122/q-prime](https://github.com/cmu15122/q-prime)
2. Click **Fork** to create your own copy
3. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/q-prime.git
   cd q-prime
   npm install
   ```

## Step 2: Create Convex Project

1. Run the Convex dev server:
   ```bash
   npx convex dev
   ```
2. When prompted, log in to Convex and create a new project
3. Note your project URLs. You can also find these in the [Convex Dashboard](https://dashboard.convex.dev) under **Settings > URL & Deploy Key**.
   - **Deployment URL**: `https://adjective-animal-123.convex.cloud`
   - **HTTP Actions URL**: `https://adjective-animal-123.convex.site`
4. If you see "Convex functions ready!" you can safely kill the process.
5. If you're setting up a production environment, at the top of the Convex Dashboard, change from "Development (Cloud)" to "Production"

## Step 3: Deploy to Vercel

Deploy the frontend first to get your Vercel URL:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** and select your forked q-prime repository
   - Note which branch Vercel is going to deploy, which should be the `preview` branch if you just link the whole repo. If you want to deploy another branch, then paste that branch's URL when making the project, e.g. `https://github.com/jacksontromero/q-prime-testing/tree/convex`
3. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run deploy`
   - **Output Directory**: `dist`
4. Add environment variables:

   | Variable            | Value                                                                               |
   | ------------------- | ----------------------------------------------------------------------------------- |
   | `CONVEX_DEPLOY_KEY` | Get from Convex Dashboard > Settings > Deploy Keys > Generate Production Deploy Key |
   | `VITE_CONVEX_URL`   | `https://adjective-animal-123.convex.cloud` (your Convex deployment URL)            |

5. Click **Deploy**
6. **Note your Vercel URL** (e.g., `https://q-prime-abc123.vercel.app`)

The first deploy will likely fail because OAuth isn't configured yet - that's expected.

## Step 4: Set Up Google OAuth

Note: If you want to use a custom domain, see the [Custom Domain](#custom-domain) section.

Now that you have both your Convex and Vercel URLs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **APIs & Services > OAuth consent screen**
   - Select **External** user type
   - Fill in app name and your email
   - Add scopes: `email`, `profile`, `openid`
   - **Publish** the app when ready
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins** (use YOUR Vercel URL):
     ```
     https://q-prime-abc123.vercel.app
     ```
   - **Authorized redirect URIs** (use YOUR Convex site URL):
     ```
     https://adjective-animal-123.convex.site/api/auth/callback/google
     ```
6. Save your **Client ID** and **Client Secret**

## Step 5: Configure Convex Environment Variables

First, generate the required JWT keys:

```bash
node generateKeys.mjs
```

This outputs two environment variables. Copy them.

In the [Convex Dashboard](https://dashboard.convex.dev), go to **Settings > Environment Variables** and add:

| Variable             | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| `AUTH_GOOGLE_ID`     | Your Google Client ID                                        |
| `AUTH_GOOGLE_SECRET` | Your Google Client Secret                                    |
| `SITE_URL`           | `https://q-prime-abc123.vercel.app` (your actual Vercel URL) |
| `JWT_PRIVATE_KEY`    | Output from `generateKeys.mjs` (starts with `-----BEGIN...`) |
| `JWKS`               | Output from `generateKeys.mjs` (JSON with `keys` array)      |
| `HTTP_API_PREFIX`    | `` (empty string - no nginx proxy in hosted setup)          |

## Step 6: Redeploy

Trigger a redeploy now that everything is configured:

1. In Vercel, go to your project **Deployments**
2. Click the three dots on your latest deployment
3. Click **Redeploy**

Or push an empty commit:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Step 7: Initial Setup

1. Visit your Vercel URL (e.g., `https://q-prime-abc123.vercel.app`)
2. Click **Log In** and authenticate with Google
3. You'll be redirected to the initial setup page
4. Enter:
   - **Semester name** (e.g., "Fall 2026")
   - **Owner email(s)** - your admin email address(es)
5. Click **Save** to initialize the database

## Custom Domain

### Vercel Custom Domain

1. In Vercel, go to your project **Settings > Domains**
2. Add your custom domain and follow DNS instructions
3. Update `SITE_URL` in Convex to match your custom domain
4. Update Google OAuth origins and redirect URIs

### Convex Custom Domain (Pro Plan)

With Convex Pro, you can use a custom domain for the OAuth consent screen instead of `adjective-animal-123.convex.site`. See [Convex docs](https://docs.convex.dev) for setup instructions.

## Updating Your Deployment

### Code Changes

Simply push to your main branch - Vercel will automatically redeploy:

```bash
git add .
git commit -m "Your changes"
git push
```

### Convex Function Changes

Vercel's build command (`npx convex deploy --cmd 'npm run build'`) automatically deploys Convex functions during each build.

### Environment Variable Changes

1. Update in Convex Dashboard and/or Vercel Dashboard
2. Trigger a redeploy in Vercel (Settings > Deployments > Redeploy)

## Troubleshooting

### OAuth Error: redirect_uri_mismatch

Your Google OAuth redirect URI doesn't match. Ensure it's exactly:

```
https://YOUR-CONVEX-PROJECT.convex.site/api/auth/callback/google
```

### OAuth Error: invalid_client

- Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set correctly in Convex
- Ensure your Google OAuth app is **published** (not in testing mode)

### "Not authenticated" errors

- Check that `SITE_URL` in Convex matches your actual frontend URL
- Ensure cookies are enabled in your browser

### Build failures on Vercel

- Check that `CONVEX_DEPLOY_KEY` is set correctly
- Verify `VITE_CONVEX_URL` points to your `.convex.cloud` URL

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │  Convex Cloud   │
│   (Frontend)    │────▶│   (Backend)     │
│                 │     │                 │
│  - React/Vite   │     │  - Functions    │
│  - Static files │     │  - Database     │
│  - CDN          │     │  - Auth         │
└─────────────────┘     └─────────────────┘
        │                       │
        │         ┌─────────────┘
        │         │
        ▼         ▼
┌─────────────────────────┐
│      Google OAuth       │
│  (Authentication)       │
└─────────────────────────┘
```

## Cost

Both Convex and Vercel have generous free tiers that should cover most small to medium deployments:

- **Convex Free Tier**: Includes database, functions, and auth
- **Vercel Free Tier**: Includes hosting, CDN, and automatic deployments

See [Convex Pricing](https://convex.dev/pricing) and [Vercel Pricing](https://vercel.com/pricing) for details.
