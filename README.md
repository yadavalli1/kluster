# Kluster

AI-powered spec-driven development platform. Capture requirements through conversational AI, generate technical implementation plans, manage tasks, and deploy to Kubernetes or Docker — all from one interface.

## Features

- **Drawing Board** — Conversational AI interface for capturing application requirements. Supports three modes: conversational, structured form, and document editor. Guides users through defining what they're building, why, success criteria, and edge cases.
- **AI Plan Generation** — Generates detailed technical implementation plans from specs using OpenAI. Includes architecture overview, task breakdown with dependencies, effort estimates, risk analysis, and phased timelines.
- **Task Board** — Kanban-style board for tracking implementation tasks. Tasks are auto-created from AI-generated plans with priorities (Critical/High/Medium/Low), dependencies, and assignments.
- **Deployments** — Monitor and manage deployments across environments (Production, Staging). Supports Kubernetes and AWS ECS targets with status tracking, version history, and rollback.
- **Approvals** — Review workflow for plans and deployments. Pending items require sign-off from designated reviewers before proceeding.
- **Git Integration** — GitHub integration via Octokit for repository management. View commit history, manage branches, sync repos, and push files programmatically.
- **Workspaces** — Multi-tenant workspace management with role-based access (Owner, Admin, Member, Viewer). Each workspace has its own projects, secrets, AI settings, and deployment targets.
- **Real-time Notifications** — Server-sent events (SSE) for live notification streaming.
- **Markdown Editor** — Monaco-based editor for writing specs and documentation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Auth | [Clerk](https://clerk.com/) |
| Database | PostgreSQL with [Prisma 7](https://www.prisma.io/) ORM |
| AI | [OpenAI](https://openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/) |
| Git | [Octokit](https://github.com/octokit/rest.js) (GitHub API) |
| State | [Zustand](https://zustand.docs.pmnd.rs/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |

## Prerequisites

- **Node.js** >= 20
- **Docker** and **Docker Compose** (for containerized setup)
- **Clerk account** — sign up at [clerk.com](https://clerk.com) for authentication keys
- **OpenAI API key** — required for AI plan generation features (optional for basic UI)

## Project Structure

```
kluster/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Main dashboard
│   │   ├── drawing-board/      # Requirements capture UI
│   │   ├── tasks/              # Kanban task board
│   │   ├── deployments/        # Deployment management
│   │   ├── approvals/          # Approval workflows
│   │   ├── git/                # Git integration UI
│   │   ├── workspaces/         # Workspace management
│   │   ├── specs/editor/       # Markdown spec editor
│   │   └── api/                # API routes (health, notifications)
│   ├── components/             # Shared React components
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── task-board.tsx      # Kanban board component
│   │   ├── plan-generator.tsx  # AI plan generation UI
│   │   ├── markdown-editor.tsx # Monaco markdown editor
│   │   └── realtime-notifications.tsx
│   ├── lib/
│   │   ├── db.ts               # Prisma client (PrismaPg adapter)
│   │   ├── ai/plan-generator.ts # OpenAI plan generation logic
│   │   ├── git/service.ts      # GitHub API integration
│   │   └── utils.ts            # Utility functions
│   └── generated/prisma/       # Auto-generated Prisma client
├── prisma/
│   └── schema.prisma           # Database schema
├── k8s/                        # Kubernetes manifests
│   ├── deployment.yaml         # App deployment + service + ingress
│   ├── postgres.yaml           # PostgreSQL deployment
│   └── README.md               # K8s setup guide
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Local Docker setup with PostgreSQL
└── prisma.config.ts            # Prisma configuration
```

## Getting Started

### Option 1: Docker (Recommended)

The simplest way to run the full stack locally.

**1. Clone the repository:**

```bash
git clone https://github.com/Kluster-Preview/vibecode-101.git
cd vibecode-101
```

**2. Configure environment variables:**

Create a `.env.docker` file in the project root:

```env
# Required — get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Optional — needed for AI plan generation
OPENAI_API_KEY=sk-your_key_here
```

**3. Build and start:**

```bash
docker compose --env-file .env.docker up --build -d
```

This will:
- Start a PostgreSQL 15 database
- Run Prisma schema push to create all tables
- Build and start the Next.js app

**4. Verify it's running:**

```bash
# Check container status
docker compose ps

# Check app logs
docker compose logs app

# Test health endpoint
curl http://localhost:3000/api/health
```

**5. Open the app:**

Navigate to [http://localhost:3000](http://localhost:3000)

**Stopping the app:**

```bash
docker compose down          # Stop containers (keeps data)
docker compose down -v       # Stop and delete database volume
```

### Option 2: Local Development (Without Docker)

For active development with hot reload.

**1. Clone and install:**

```bash
git clone https://github.com/Kluster-Preview/vibecode-101.git
cd vibecode-101
npm install
```

**2. Set up PostgreSQL:**

You need a running PostgreSQL instance. You can start one with Docker:

```bash
docker run -d \
  --name kluster-db \
  -e POSTGRES_USER=kluster \
  -e POSTGRES_PASSWORD=kluster_secret \
  -e POSTGRES_DB=kluster \
  -p 5432:5432 \
  postgres:15-alpine
```

**3. Configure environment:**

Create a `.env` file:

```env
DATABASE_URL="postgresql://kluster:kluster_secret@localhost:5432/kluster?sslmode=disable"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

OPENAI_API_KEY=sk-your_key_here

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**4. Generate Prisma client and push schema:**

```bash
npx prisma generate
npx prisma db push
```

**5. Start the dev server:**

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000) with hot reload.

## Deployment

### Docker Production Build

The Dockerfile uses a multi-stage build with Next.js `standalone` output for a minimal production image.

```bash
# Build the image
docker build -t kluster:latest .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/kluster" \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." \
  -e CLERK_SECRET_KEY="sk_test_..." \
  -e OPENAI_API_KEY="sk-..." \
  kluster:latest
```

### Kubernetes

The `k8s/` directory contains manifests for deploying to a local Kubernetes cluster.

**With Minikube:**

```bash
# Start minikube
minikube start --driver=docker --cpus=4 --memory=4096
minikube addons enable ingress

# Create secrets
kubectl create namespace kluster
kubectl create secret generic kluster-secrets \
  --from-literal=database-url='postgresql://kluster:password@postgres:5432/kluster' \
  --from-literal=clerk-publishable-key='pk_test_...' \
  --from-literal=clerk-secret-key='sk_test_...' \
  --from-literal=openai-key='sk-...' \
  --from-literal=db-password='password' \
  --namespace kluster

# Build and load the image
docker build -t kluster:latest .
minikube image load kluster:latest

# Deploy
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/deployment.yaml

# Wait for pods
kubectl wait --for=condition=ready pod -l app=postgres -n kluster --timeout=120s
kubectl wait --for=condition=ready pod -l app=kluster -n kluster --timeout=120s

# Access the app
minikube service kluster-service -n kluster --url
```

**With Kind:**

```bash
# Create cluster with port mappings
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
- role: worker
EOF

# Install NGINX ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Load image and deploy
kind load docker-image kluster:latest
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/deployment.yaml
```

Then add `127.0.0.1 kluster.local` to `/etc/hosts` and access at http://kluster.local.

See [`k8s/README.md`](k8s/README.md) for more Kubernetes commands.

## Database Schema

The app uses the following data models:

| Model | Description |
|-------|-------------|
| `Workspace` | Top-level tenant with projects, secrets, and settings |
| `WorkspaceMember` | User membership with roles (Owner/Admin/Member/Viewer) |
| `Project` | Application being built, linked to a workspace |
| `DrawingBoard` | Requirements capture with conversation history and files |
| `ConversationMessage` | Individual messages in the drawing board conversation |
| `Plan` | AI-generated implementation plan with version tracking |
| `Task` | Individual work item with status, priority, and dependencies |
| `Deployment` | Deployment record with status tracking and logs |
| `DeploymentTarget` | Configured deployment destination (K8s, AWS, local) |
| `Secret` | Encrypted secrets scoped to workspace or project |
| `AISettings` | Per-workspace AI provider configuration |

To explore the schema interactively:

```bash
npx prisma studio
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to database |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (from dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `OPENAI_API_KEY` | No | OpenAI API key for AI plan generation |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Sign-in page path (default: `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Sign-up page path (default: `/sign-up`) |
| `NEXT_PUBLIC_APP_URL` | No | Application URL (default: `http://localhost:3000`) |

## Troubleshooting

**"Publishable key not valid" error**
Clerk requires real API keys. Get them from [dashboard.clerk.com](https://dashboard.clerk.com) and set the environment variables.

**Database connection errors**
Ensure PostgreSQL is running and `DATABASE_URL` is correct. For Docker, the database hostname is `db` (the service name), not `localhost`.

**Prisma schema push fails**
Make sure you're using Prisma 7. The schema uses Prisma 7 syntax (no `url` in datasource block). Run `npx prisma generate` before `npx prisma db push`.

**Docker build fails with "EBADENGINE" warning**
This is a non-fatal warning about `@prisma/streams-local` wanting Node >= 22. The build still succeeds on Node 20.

## License

Private project. All rights reserved.
