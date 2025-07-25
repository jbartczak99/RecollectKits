# RecollectKits MVP - Product Requirements Document

## Executive Summary

**Product Name:** RecollectKits MVP  
**Target:** Functional prototype for December 2025 launch  
**Tech Stack:** React + Supabase  
**Core Goal:** Prove concept with essential features only

### MVP Success Criteria
- User registration and authentication working
- Basic jersey database with CRUD operations
- Simple collection tracking (Have/Want)
- Functional bounty system
- Basic jersey spotting
- Mobile-responsive design

---

## Technical Architecture

### Technology Stack
```yaml
Frontend: React 18 + Vite
Backend: Supabase (PostgreSQL + APIs)
Authentication: Supabase Auth
Database: PostgreSQL (via Supabase)
Storage: Supabase Storage (images)
Styling: Tailwind CSS
Deployment: Vercel
```

### Supabase Configuration
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jerseys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE jersey_spots ENABLE ROW LEVEL SECURITY;
```

---

## Database Schema (MVP)

### Core Tables

#### 1. User Profiles (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. Jerseys
```sql
CREATE TABLE jerseys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_name TEXT NOT NULL,
  season_year TEXT NOT NULL,
  jersey_type TEXT CHECK (jersey_type IN ('home', 'away', 'third', 'special')) NOT NULL,
  manufacturer TEXT,
  sponsor TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  description TEXT,
  rarity_level TEXT CHECK (rarity_level IN ('common', 'uncommon', 'rare', 'ultra_rare')) DEFAULT 'common',
  image_url TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved BOOLEAN DEFAULT false
);

-- RLS Policies
CREATE POLICY "Approved jerseys are viewable by everyone" ON jerseys
  FOR SELECT USING (approved = true);
CREATE POLICY "Users can create jerseys" ON jerseys
  FOR INSERT WITH CHECK (auth.uid() = created_by);
```

#### 3. User Collections
```sql
CREATE TABLE user_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  jersey_id UUID REFERENCES jerseys NOT NULL,
  status TEXT CHECK (status IN ('have', 'want')) NOT NULL,
  condition TEXT CHECK (condition IN ('mint', 'excellent', 'good', 'fair', 'poor')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, jersey_id)
);

-- RLS Policies
CREATE POLICY "Users can view own collections" ON user_collections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own collections" ON user_collections
  FOR ALL USING (auth.uid() = user_id);
```

#### 4. Bounties (MVP Version)
```sql
CREATE TABLE bounties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES auth.users NOT NULL,
  jersey_id UUID REFERENCES jerseys,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_points INTEGER DEFAULT 10,
  status TEXT CHECK (status IN ('active', 'fulfilled', 'expired')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_by UUID REFERENCES auth.users,
  fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
CREATE POLICY "Active bounties are viewable by everyone" ON bounties
  FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create bounties" ON bounties
  FOR INSERT WITH CHECK (auth.uid() = created_by);
```

#### 5. Jersey Spots (MVP Version)
```sql
CREATE TABLE jersey_spots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  spotted_by UUID REFERENCES auth.users NOT NULL,
  jersey_id UUID REFERENCES jerseys NOT NULL,
  source_url TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  condition TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT false
);

-- RLS Policies
CREATE POLICY "Jersey spots are viewable by everyone" ON jersey_spots
  FOR SELECT USING (true);
CREATE POLICY "Users can create spots" ON jersey_spots
  FOR INSERT WITH CHECK (auth.uid() = spotted_by);
```

---

## MVP Features Specification

### 1. Authentication (Supabase Auth)
**Implementation:**
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Register
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      username: 'collector123'
    }
  }
})
```

**Components Needed:**
- `LoginForm.jsx`
- `RegisterForm.jsx`
- `AuthLayout.jsx`
- `ProtectedRoute.jsx`

### 2. Jersey Database (CRUD)
**Key Operations:**
```javascript
// Create jersey
const { data, error } = await supabase
  .from('jerseys')
  .insert({
    team_name: 'Arsenal',
    season_year: '1991-92',
    jersey_type: 'home',
    manufacturer: 'Adidas'
  })

// Read jerseys with search
const { data, error } = await supabase
  .from('jerseys')
  .select('*')
  .eq('approved', true)
  .ilike('team_name', `%${searchTerm}%`)
```

**Components Needed:**
- `JerseyCard.jsx`
- `JerseyForm.jsx`
- `JerseyGrid.jsx`
- `JerseySearch.jsx`
- `JerseyDetails.jsx`

### 3. Collection Management
**Core Functionality:**
```javascript
// Add to collection
const { data, error } = await supabase
  .from('user_collections')
  .upsert({
    user_id: user.id,
    jersey_id: jerseyId,
    status: 'have'
  })

// Get user collection
const { data, error } = await supabase
  .from('user_collections')
  .select(`
    *,
    jerseys (
      team_name,
      season_year,
      image_url
    )
  `)
  .eq('user_id', user.id)
```

**Components Needed:**
- `CollectionView.jsx`
- `CollectionStats.jsx`
- `AddToCollectionButton.jsx`

### 4. Bounty System (Simplified)
**Basic Operations:**
```javascript
// Create bounty
const { data, error } = await supabase
  .from('bounties')
  .insert({
    title: 'Need photo of Arsenal 1991 away jersey',
    description: 'Looking for clear front/back photos',
    jersey_id: jerseyId,
    reward_points: 25
  })

// Get active bounties
const { data, error } = await supabase
  .from('bounties')
  .select(`
    *,
    jerseys (team_name, season_year),
    profiles!created_by (username)
  `)
  .eq('status', 'active')
```

**Components Needed:**
- `BountyCard.jsx`
- `BountyForm.jsx`
- `BountyBoard.jsx`
- `FulfillBountyModal.jsx`

### 5. Jersey Spotting (Basic)
**Spot Creation:**
```javascript
// Report jersey spot
const { data, error } = await supabase
  .from('jersey_spots')
  .insert({
    jersey_id: jerseyId,
    source_url: 'https://ebay.com/item/123',
    price: 85.00,
    condition: 'excellent',
    description: 'Great condition, original tags'
  })
```

**Components Needed:**
- `SpotForm.jsx`
- `SpotCard.jsx`
- `SpottingFeed.jsx`

---

## Component Architecture

### App Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── jerseys/
│   │   ├── JerseyCard.jsx
│   │   ├── JerseyForm.jsx
│   │   ├── JerseyGrid.jsx
│   │   └── JerseySearch.jsx
│   ├── collection/
│   │   ├── CollectionView.jsx
│   │   └── AddToCollectionButton.jsx
│   ├── bounties/
│   │   ├── BountyCard.jsx
│   │   ├── BountyForm.jsx
│   │   └── BountyBoard.jsx
│   └── spots/
│       ├── SpotForm.jsx
│       └── SpottingFeed.jsx
├── pages/
│   ├── Home.jsx
│   ├── Jerseys.jsx
│   ├── Collection.jsx
│   ├── Bounties.jsx
│   └── Spots.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useJerseys.js
│   └── useBounties.js
└── lib/
    └── supabase.js
```

### Key React Hooks
```javascript
// useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return { user, loading }
}

// useJerseys.js
export function useJerseys(searchTerm = '') {
  const [jerseys, setJerseys] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchJerseys = async () => {
      let query = supabase
        .from('jerseys')
        .select('*')
        .eq('approved', true)
        
      if (searchTerm) {
        query = query.ilike('team_name', `%${searchTerm}%`)
      }
      
      const { data, error } = await query
      if (!error) setJerseys(data)
      setLoading(false)
    }
    
    fetchJerseys()
  }, [searchTerm])
  
  return { jerseys, loading }
}
```

---

## MVP User Interface Requirements

### Design System (Tailwind Classes)
```css
/* Color Palette */
.primary: bg-green-600 text-white
.secondary: bg-gray-100 text-gray-900
.accent: bg-blue-500 text-white
.danger: bg-red-500 text-white

/* Layout */
.container: max-w-6xl mx-auto px-4
.card: bg-white rounded-lg shadow-md p-6
.button: px-4 py-2 rounded-md font-medium transition-colors
```

### Page Layouts

#### 1. Homepage
```jsx
function Home() {
  return (
    <div className="space-y-8">
      <Hero />
      <FeaturedJerseys />
      <ActiveBounties limit={3} />
      <RecentSpots limit={5} />
    </div>
  )
}
```

#### 2. Jersey Database
```jsx
function Jerseys() {
  const [searchTerm, setSearchTerm] = useState('')
  const { jerseys, loading } = useJerseys(searchTerm)
  
  return (
    <div>
      <JerseySearch value={searchTerm} onChange={setSearchTerm} />
      <JerseyGrid jerseys={jerseys} loading={loading} />
    </div>
  )
}
```

#### 3. User Collection
```jsx
function Collection() {
  const { user } = useAuth()
  const { collection, loading } = useCollection(user?.id)
  
  return (
    <div>
      <CollectionStats collection={collection} />
      <CollectionView collection={collection} loading={loading} />
    </div>
  )
}
```

---

## Real-time Features (Supabase Realtime)

### Bounty Updates
```javascript
// Subscribe to bounty changes
useEffect(() => {
  const subscription = supabase
    .channel('bounty-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bounties' },
      (payload) => {
        // Update bounties in real-time
        setBounties(current => 
          current.map(bounty => 
            bounty.id === payload.new.id ? payload.new : bounty
          )
        )
      }
    )
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

### Jersey Spot Notifications
```javascript
// Notify users when jerseys on their wishlist are spotted
const { data: subscription } = supabase
  .channel('jersey-spots')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'jersey_spots' },
    (payload) => {
      // Check if spotted jersey is on user's wishlist
      checkWishlistMatch(payload.new.jersey_id)
    }
  )
  .subscribe()
```

---

## Environment Setup

### Supabase Configuration
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "vite": "^4.4.5",
    "@vitejs/plugin-react": "^4.0.3",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

---

## MVP Development Priorities

### Phase 1: Foundation (Week 1-2)
1. ✅ Set up React + Vite project
2. ✅ Configure Supabase connection
3. ✅ Implement authentication
4. ✅ Create basic database schema
5. ✅ Build core layout and navigation

### Phase 2: Core Features (Week 3-4)
1. ✅ Jersey CRUD operations
2. ✅ Collection management
3. ✅ Basic search functionality
4. ✅ User profiles

### Phase 3: Advanced Features (Week 5-6)
1. ✅ Bounty system
2. ✅ Jersey spotting
3. ✅ Real-time updates
4. ✅ Image upload for jerseys

### Phase 4: Polish (Week 7-8)
1. ✅ Mobile responsiveness
2. ✅ Error handling
3. ✅ Loading states
4. ✅ Basic admin features

---

## Success Metrics for MVP

### Technical Metrics
- [ ] All CRUD operations working
- [ ] Authentication flow complete
- [ ] Real-time updates functional
- [ ] Mobile-responsive design
- [ ] Fast loading (<2 seconds)

### User Experience Metrics
- [ ] User can register and login
- [ ] User can add jerseys to collection
- [ ] User can create and fulfill bounties
- [ ] User can spot jerseys
- [ ] Intuitive navigation and UX

### Business Validation
- [ ] Demonstrates core value proposition
- [ ] Shows potential for community engagement
- [ ] Validates bounty system concept
- [ ] Proves affiliate integration potential

---

## Post-MVP Enhancements

### Immediate Next Steps
1. **Payment Integration**: Stripe for bounty rewards
2. **Advanced Search**: Filters and sorting
3. **Social Features**: Following, likes, comments
4. **Notifications**: Email and push notifications
5. **Admin Panel**: Content moderation tools

### Future Features
1. **Mobile App**: React Native version
2. **AI Features**: Jersey recognition, price prediction
3. **Marketplace**: Full e-commerce functionality
4. **Analytics**: User behavior tracking
5. **API**: Third-party integrations

---

This MVP-focused PRD gives Claude Code everything needed to build a functional prototype that demonstrates the core value proposition of RecollectKits while leveraging Supabase's powerful features for rapid development.