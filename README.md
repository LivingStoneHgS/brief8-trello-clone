# Trello Clone - Educational Project

A simplified Trello clone built with React, TypeScript, and Supabase, designed specifically for teaching purposes. This project demonstrates modern web development practices including real-time updates, authentication, and database management using Supabase.

## Description

This application is a learning-focused implementation of a Kanban board system similar to Trello. It showcases:
- Modern React development with TypeScript
- Supabase integration for backend services
- User authentication and authorization
- Clean architecture patterns

The project is intentionally simplified to focus on core concepts while maintaining production-quality code standards.

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm package manager
- Git
- Docker (for local Supabase development)

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/trello-clone.git
cd trello-clone

# Install dependencies
npm install
```

## Supabase Configuration

### 1. Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in:
   - Project name: `trello-clone` (or your preferred name)
   - Database password: Generate a secure password and save it
   - Region: Choose the closest region to you
3. Wait for project initialization (takes 1-2 minutes)
4. Once ready, go to Settings → API to find your project credentials

### 2. Environment Configuration

#### For Production/Remote Database:
Create a `.env.development` file in the root directory:

```bash
cp .env.localhost .env.development
```

Then update the file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Template for `.env.development`:**
```env
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### For Local Database:
Create a `.env.localhost` file in the root directory:

```bash
cp .env.localhost .env.localhost
```

**Template for `.env.localhost`:**
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 3. Supabase CLI Setup

Install the Supabase CLI if you haven't already:

```bash
# macOS
brew install supabase/tap/supabase

# Windows (with Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
sudo apt install snapd
sudo snap install supabase
```

### 4. Link Your Project

Link your local development environment to your Supabase project:

```bash
supabase link --project-ref [PROJECT-REF]
```
**What it does:** Creates a connection between your local project and the remote Supabase project, allowing you to push migrations and manage your database schema.

### 5. Initialize Supabase

```bash
supabase init
```
**What it does:** Initializes the Supabase configuration in your project, creating necessary configuration files and setting up the local development structure.

### 6. Start Local Supabase

```bash
supabase start
```
**What it does:** Starts a local Supabase development environment using Docker. This includes:
- PostgreSQL database
- Authentication service
- Storage service
- Real-time API
- Studio dashboard (accessible at http://localhost:54323)

### 7. Reset Database

```bash
supabase db reset
```
**What it does:** Resets your local database to a clean state and applies all migrations from the `supabase/migrations` folder. Use this when you want to start fresh or after pulling new migrations.

### 8. Push Schema to Production

```bash
supabase db push
```
**What it does:** Pushes your local database schema (all migrations) to your remote Supabase project. This syncs your database structure with production.

### 9. Local Development Setup

After starting your local Supabase instance, use the local development command:

```bash
npm run dev:local
```
**What it does:** Starts the development server and connects to your local Supabase database instead of the remote one. This uses the `.env.localhost` configuration which points to `http://localhost:54321`.

### 10. Create Your Account

1. Start your development server: `npm run dev:local` (for local) or `npm run dev` (for remote)
2. Navigate to `http://localhost:5173`
3. Click "Sign Up" and create your first account
4. After signing up, you'll be redirected to the home page where you can create your first board

## Development Commands

```bash
# Start development server with local database
npm run dev:local

# Start development server with remote database
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
trello-clone/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and configurations
│   ├── pages/          # Page components
│   └── services/       # API and business logic
├── supabase/
│   ├── migrations/     # Database schema migrations
│   └── config.toml     # Supabase configuration
└── public/             # Static assets
```

## Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

This is an educational project. Feel free to fork, experiment, and learn!

## License

MIT License - see LICENSE file for details.
