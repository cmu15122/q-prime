# Local Development

Get q' running locally for development.

## Prerequisites

- Node.js 20+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- A Google Cloud project for OAuth

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/cmu15122/q-prime.git
   cd q-prime
   npm install
   ```

2. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create or select a project
   - Go to **APIs & Services > OAuth consent screen**
     - Select **External** user type
     - Fill in required fields, then **Publish** the app
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
     - Application type: **Web application**
     - Authorized JavaScript origins: `http://localhost:5173`
     - Authorized redirect URIs (add one based on your choice in step 5):
       - **Local Convex**: `http://localhost:3211/api/auth/callback/google` and `http://127.0.0.1:3211/api/auth/callback/google`
       - **Cloud Convex**: `https://YOUR-PROJECT.convex.site/api/auth/callback/google`
   - Save your **Client ID** and **Client Secret**

3. **Generate JWT keys:**

   ```bash
   node generateKeys.mjs
   ```

   Copy the output (you'll need it in step 4).

4. **Create `.env.local`** (frontend variables only):

   ```bash
   # Frontend (Vite) - required for the React app
   VITE_CONVEX_URL=http://localhost:3210
   VITE_APP_CONVEX_SITE_URL=http://localhost:3211
   ```

5. **Start Convex and choose deployment type:**

   ```bash
   npm run dev
   ```

   When prompted, choose:
   - **Local**: Faster sync, no quota usage, redirect URI uses `localhost:3211`
   - **Cloud**: Easier setup, redirect URI uses `YOUR-PROJECT.convex.site`

   Make sure your Google OAuth redirect URI (step 2) matches your choice.

6. **Set Convex backend environment variables:**

   In a separate terminal (while `npx convex dev` is running). You can also set these in the Convex Dashboard:

   ```bash
   # OAuth credentials
   npx convex env set AUTH_GOOGLE_ID your-google-client-id.apps.googleusercontent.com
   npx convex env set AUTH_GOOGLE_SECRET your-google-client-secret
   npx convex env set SITE_URL http://localhost:5173

   # JWT keys (paste the values from step 3)
   npx convex env set JWT_PRIVATE_KEY "-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----"
   npx convex env set JWKS '{"keys":[...]}'

   # Local dev doesn't use nginx, so no /api prefix
   npx convex env set HTTP_API_PREFIX ""
   ```

   Note: These are set on the Convex deployment, not in `.env.local`.

7. **Use the OHQ:**

   You can access the main OHQ page at http://localhost:5173 and the Convex Dashboard at https://dashboard.convex.dev (even if you're using a local Convex deployment, it'll show up here).

## Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start backend + frontend together        |
| `npm run dev:backend`  | Start Convex backend only                |
| `npm run dev:frontend` | Start Vite frontend only                 |
| `npm run build`        | Build for production (with checks)       |
| `npm run lint`         | Run ESLint                               |
| `npm run format`       | Format code with Prettier                |
| `npm run check`        | Run all checks (typecheck, lint, format) |

After initial setup, you can use `npm run dev` to start both together.

## Notes

- Local development uses Convex's local backend (data stored in `~/.convex`)
- Changes to `convex/` files are automatically synced
- Frontend hot-reloads on changes to `src/`
