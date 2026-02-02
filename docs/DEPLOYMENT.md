# Deployment Options

q' supports multiple deployment configurations depending on your needs.

## Hosted (Recommended)

**[Convex Cloud + Vercel](./deployments/HOSTED.md)**

The easiest option. Use managed services with generous free tiers:

- **Convex Cloud** handles the backend (database, functions, auth)
  - Built-in dashboard with logs, metrics, and data browser
  - Real-time function logs for debugging
  - Database explorer to inspect and edit data
  - Usage analytics and performance monitoring
- **Vercel** handles the frontend (static hosting, CDN)
  - GitHub integration with automatic deployments on push
  - Preview deployments for pull requests
  - Built-in analytics and error tracking
  - Global CDN for fast load times
- No infrastructure to manage, no servers to maintain
- Easy to switch between local dev and prod, GitHub integration auto-redeploys after a push.

Best for: Most users, getting started quickly, teams that want CI/CD out of the box.

## Self-Hosted

**[Self-Hosted on AWS EC2](./deployments/AWS.md)**

Run everything on your own AWS EC2 instance using Docker:

- Full control over infrastructure
- Single server with Docker Compose
- If your EC2 instance is within Free Tier, don't have to worry about hitting Free Tier limits like Convex and Vercel

**[General Self-Hosting Guide](./deployments/SELF_HOST.md)**

Generic instructions for self-hosting on any Linux server (not AWS-specific).
