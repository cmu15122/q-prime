# q'

## The new Office Hours Queue for CMU's 15-122 Principles of Imperative Programming.

**The Squad (Summer '22 - Fall '25):** Pranav Addepalli, Angela Zhang, Amanda Li, Bhargav Hadya, Brandon Sommerfeld, Esther Cao, Jackson Romero, Lora Zhou, Mengrou Shou, Arthur Jakobsson, Benjamin Kwabi-Addo, Kevin Wang, Yutian Chen, Mihir Khare, Sherry Wang, Alex Blass, Alice Tang, Jeffrey Shen, Alice Zhang,

**V2 Contributors (Spring '26 +)** Jackson Romero

## What is q'?

q' is a real-time office hours queue that helps students get help from TAs efficiently. Students can join the queue, describe their question, and track their position in line. TAs can see the queue, help students, and manage the flow of office hours.

### Features

- **Real-time updates** - Queue changes are instantly visible to all users
- **Google OAuth** - Students and TAs sign in with their Google accounts
- **Queue management** - TAs can help, message, or remove students from the queue
- **Announcements** - Broadcast messages to everyone viewing the queue
- **Metrics & analytics** - Track wait times, help times, and TA performance
- **Configurable settings** - Customize queue behavior, topics, locations, and access control

## Getting Started

- **[Local Development](./docs/LOCAL_DEV.md)** - Set up your development environment
- **[Deployment Options](./docs/DEPLOYMENT.md)** - Deploy to production (Convex Cloud + Vercel or self-hosted)

## Architecture

q' is built with a modern real-time stack:

### Frontend (React + Vite)

The `src/` folder contains a [React](https://react.dev) single-page application bundled with [Vite](https://vitejs.dev). React handles all the UI rendering and user interactions. The app uses React Router for navigation between pages (home, settings, metrics).

### Backend (Convex)

The `convex/` folder contains the backend powered by [Convex](https://convex.dev), a real-time backend-as-a-service. Convex provides:

- **Database** - A reactive document database that automatically syncs changes to all connected clients
- **Functions** - Serverless queries (read data) and mutations (write data) that run on Convex's infrastructure
- **Authentication** - Built-in auth with Google OAuth via `@convex-dev/auth`
- **Real-time sync** - No need for WebSocket code; Convex handles real-time updates automatically

The general flow of data is:

1. User visits the app and authenticates via Google OAuth
2. React components subscribe to Convex queries (e.g., "get all queue entries")
3. When data changes (e.g., a student joins the queue), Convex automatically pushes updates to all subscribed clients
4. To modify data, components call Convex mutations (e.g., "add me to the queue")

## Project Structure

```
├── convex/           # Backend: database schema, queries, mutations, auth
│   ├── schema.ts     # Database schema definitions
│   ├── auth.ts       # Authentication configuration
│   ├── http.ts       # HTTP endpoints (CSV upload/download)
│   └── *.ts          # Query and mutation functions
├── src/              # Frontend: React components and pages
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components (home, settings, metrics)
│   └── index.tsx     # App entry point
├── docs/             # Documentation
└── docker/           # Self-hosting configuration
```
