-- Rollback for sprint0_rls_tightening.sql — restores the exact live state
-- captured from pg_policies on 2026-06-11 before the migration ran.

-- 1. Restore wide-open write policies
CREATE POLICY "Authenticated users can insert team squads"
  ON team_squads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update team squads"
  ON team_squads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete team squads"
  ON team_squads FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert squad cache"
  ON kit_squad_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update squad cache"
  ON kit_squad_cache FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete squad cache"
  ON kit_squad_cache FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert careers"
  ON player_careers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update careers"
  ON player_careers FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. notifications
DROP POLICY IF EXISTS "Users create notifications they are part of" ON notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. user_badges
DROP POLICY IF EXISTS "Users can award badges to themselves" ON user_badges;
CREATE POLICY "Authenticated users can insert user_badges"
  ON user_badges FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. partner_applications
DROP POLICY IF EXISTS "Anyone can submit partner applications" ON partner_applications;
CREATE POLICY "Anyone can submit partner applications"
  ON partner_applications FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 5. Deduped legacy policies
CREATE POLICY "Public collections viewable"
  ON collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view public collections"
  ON collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own collections."
  ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections."
  ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections."
  ON collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert jerseys to their collections."
  ON user_jerseys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jerseys."
  ON user_jerseys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jerseys."
  ON user_jerseys FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT USING (true);
CREATE POLICY "Careers are viewable by everyone"
  ON player_careers FOR SELECT USING (true);
CREATE POLICY "Team squads viewable by everyone"
  ON team_squads FOR SELECT USING (true);
CREATE POLICY "Squad cache viewable by everyone"
  ON kit_squad_cache FOR SELECT USING (true);

CREATE POLICY "Public Liked Kits viewable"
  ON jersey_likes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.user_id = jersey_likes.user_id
        AND collections.name = 'Liked Kits'
        AND collections.is_public = true
    )
  );
