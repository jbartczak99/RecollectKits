# Database Migration Guide - Collections System

## Overview
This migration restructures the collection system to support a main collection (all user kits) plus custom organizational collections.

## New Database Architecture

### user_jerseys table (Main Collection)
**Purpose**: Stores ALL kits a user owns (this is their "main collection")

**Changes Needed**:
- Remove `collection_id` foreign key (or make it nullable)
- This table now represents a user's complete kit collection

**Schema**:
```sql
CREATE TABLE user_jerseys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_jersey_id UUID NOT NULL REFERENCES public_jerseys(id) ON DELETE CASCADE,
  size TEXT,
  condition TEXT DEFAULT 'new', -- Purchase status: 'new' or 'used'
  notes TEXT,
  acquired_from TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, public_jersey_id)
);
```

**Note**: The `condition` field stores purchase status ('new' or 'used'), not the physical condition of the jersey.

### collections table (Custom Collections)
**Purpose**: User-created organizational collections (e.g., "Premier League", "90s Classics", etc.)

**No changes needed** - existing table is perfect:
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### collection_jerseys table (NEW - Junction Table)
**Purpose**: Many-to-many relationship between collections and user_jerseys

**Schema**:
```sql
CREATE TABLE collection_jerseys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_jersey_id UUID NOT NULL REFERENCES user_jerseys(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, user_jersey_id)
);
```

## Migration Steps

### 1. Create new junction table
```sql
CREATE TABLE collection_jerseys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_jersey_id UUID NOT NULL REFERENCES user_jerseys(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, user_jersey_id)
);
```

### 2. Migrate existing data (if you have any)
```sql
-- If you have existing user_jerseys with collection_id, migrate them:
INSERT INTO collection_jerseys (collection_id, user_jersey_id, created_at)
SELECT collection_id, id, created_at
FROM user_jerseys
WHERE collection_id IS NOT NULL;
```

### 3. Update user_jerseys table
```sql
-- Remove the foreign key constraint
ALTER TABLE user_jerseys DROP CONSTRAINT IF EXISTS user_jerseys_collection_id_fkey;

-- Make collection_id nullable or drop it entirely
ALTER TABLE user_jerseys DROP COLUMN IF EXISTS collection_id;
```

### 4. Create indexes for performance
```sql
-- Index on user_jerseys for fast user lookups
CREATE INDEX idx_user_jerseys_user_id ON user_jerseys(user_id);
CREATE INDEX idx_user_jerseys_public_jersey_id ON user_jerseys(public_jersey_id);

-- Indexes on collection_jerseys for fast joins
CREATE INDEX idx_collection_jerseys_collection_id ON collection_jerseys(collection_id);
CREATE INDEX idx_collection_jerseys_user_jersey_id ON collection_jerseys(user_jersey_id);

-- Index on collections for user lookups
CREATE INDEX idx_collections_user_id ON collections(user_id);
```

### 5. Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_jerseys ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_jerseys ENABLE ROW LEVEL SECURITY;

-- user_jerseys policies
CREATE POLICY "Users can view their own jerseys"
  ON user_jerseys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jerseys"
  ON user_jerseys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jerseys"
  ON user_jerseys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jerseys"
  ON user_jerseys FOR DELETE
  USING (auth.uid() = user_id);

-- collections policies
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections"
  ON collections FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert their own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- collection_jerseys policies
CREATE POLICY "Users can view collection jerseys for their collections"
  ON collection_jerseys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_jerseys.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert into their collections"
  ON collection_jerseys FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_jerseys.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from their collections"
  ON collection_jerseys FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_jerseys.collection_id
      AND collections.user_id = auth.uid()
    )
  );
```

## How It Works

### Adding a Kit
1. User clicks "Add to Collection" on a jersey
2. **Step 1**: Enters jersey details (size, purchase status [new/used], acquired from, notes)
3. **Step 2**: Selects which custom collections to add it to (optional)
4. System:
   - Inserts into `user_jerseys` (main collection)
   - If custom collections selected, inserts into `collection_jerseys` junction table

### Viewing Collections
- **"All Kits"** view: Shows all `user_jerseys` for the user
- **Custom Collection** view: Joins `user_jerseys` with `collection_jerseys` filtered by `collection_id`

### Benefits
- ✅ Every kit exists once in `user_jerseys`
- ✅ Kits can be in multiple custom collections
- ✅ No data duplication
- ✅ Easy to query "all kits" or filtered by collection
- ✅ Efficient storage and queries

## Routes

- `/collection` - Shows "All Kits" (main collection) + list of custom collections
- `/collection/all` - Detailed view of all kits
- `/collection/:id` - Detailed view of a custom collection
