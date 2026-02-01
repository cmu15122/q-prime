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
3. Note your project URLs from the terminal output:
   - **Deployment URL**: `https://adjective-animal-123.convex.cloud`
   - **HTTP Actions URL**: `https://adjective-animal-123.convex.site`

You can also find these in the [Convex Dashboard](https://dashboard.convex.dev) under **Settings > URL & Deploy Key**.

## Step 3: Set Up Google OAuth

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
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://your-app.vercel.app
     ```
   - **Authorized redirect URIs** (use YOUR Convex site URL):
     ```
     https://adjective-animal-123.convex.site/api/auth/callback/google
     ```
6. Save your **Client ID** and **Client Secret**

## Step 4: Configure Convex Environment Variables

In the [Convex Dashboard](https://dashboard.convex.dev), go to **Settings > Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `AUTH_GOOGLE_ID` | Your Google Client ID |
| `AUTH_GOOGLE_SECRET` | Your Google Client Secret |
| `SITE_URL` | `https://your-app.vercel.app` (your Vercel URL) |

## Step 5: Deploy to Convex Cloud

Deploy your Convex functions to production:

```bash
npx convex deploy
```

This pushes your backend functions to Convex Cloud.

## Step 6: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** and select your forked q-prime repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npx convex deploy --cmd 'npm run build'`
   - **Output Directory**: `dist`
4. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `CONVEX_DEPLOY_KEY` | Get from Convex Dashboard > Settings > URL & Deploy Key > Generate Production Deploy Key |
   | `VITE_APP_CONVEX_URL` | `https://adjective-animal-123.convex.cloud` (your Convex deployment URL) |

5. Click **Deploy**

## Step 7: Update OAuth and Environment URLs

After Vercel assigns your domain (e.g., `your-app.vercel.app`):

1. **Update Google OAuth**:
   - Go back to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add your Vercel URL to **Authorized JavaScript origins**

2. **Update Convex SITE_URL**:
   - In Convex Dashboard > Settings > Environment Variables
   - Update `SITE_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)

## Step 8: Initial Setup

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Click **Log In** and authenticate with Google
3. You'll be redirected to the initial setup page
4. Enter:
   - **Semester name** (e.g., "Fall 2026")
   - **Owner email(s)** - your admin email address(es)
5. Click **Save** to initialize the database

## Custom Domain (Optional)

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
- Verify `VITE_APP_CONVEX_URL` points to your `.convex.cloud` URL

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
