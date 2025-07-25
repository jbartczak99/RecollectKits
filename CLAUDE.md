# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the RecollectKits MVP - a React-based web application for jersey collectors. The project uses React 18 + Vite with Supabase as the backend (PostgreSQL + APIs, Authentication, Storage). The goal is to create a functional prototype for December 2025 launch.

## Technology Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + APIs)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (images)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Development Commands

Since this is a new project, the typical commands would be:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

### Component Structure
```
src/
├── components/
│   ├── auth/ (LoginForm, RegisterForm, ProtectedRoute)
│   ├── jerseys/ (JerseyCard, JerseyForm, JerseyGrid, JerseySearch)
│   ├── collection/ (CollectionView, AddToCollectionButton)
│   ├── bounties/ (BountyCard, BountyForm, BountyBoard)
│   └── spots/ (SpotForm, SpottingFeed)
├── pages/ (Home, Jerseys, Collection, Bounties, Spots)
├── hooks/ (useAuth, useJerseys, useBounties)
└── lib/supabase.js
```

### Core Database Tables
- **profiles**: User profiles extending Supabase auth.users
- **jerseys**: Jersey database with team, season, type, manufacturer details
- **user_collections**: Have/Want tracking for users
- **bounties**: User-created bounties for missing jerseys/info
- **jersey_spots**: Jersey spotting system for marketplace finds

### Key Features
1. **Authentication**: Supabase Auth with user profiles
2. **Jersey Database**: CRUD operations for jersey catalog
3. **Collection Management**: Have/Want tracking system
4. **Bounty System**: Community-driven content creation
5. **Jersey Spotting**: Marketplace discovery and sharing

## Environment Configuration

Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase client setup in `lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Development Patterns

### Test Driven Development
When developing this project follow test driven development principles. Always create tests for features before actually creating the components. Commit the tests and when building the application do not stop until all the tests pass and do not modify the tests that were originally speced.

### Authentication Hook
Use `useAuth()` hook for user state management across components.

### Database Operations
All database operations use Supabase client with Row Level Security (RLS) policies enabled.

### Real-time Features
Implement real-time updates using Supabase Realtime for bounties and jersey spots.

### Styling
Use Tailwind CSS with defined color palette:
- Primary: green-600
- Secondary: gray-100
- Accent: blue-500
- Danger: red-500

## MVP Success Criteria
- User registration and authentication working
- Basic jersey database with CRUD operations
- Simple collection tracking (Have/Want)
- Functional bounty system
- Basic jersey spotting
- Mobile-responsive design