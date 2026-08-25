/*
# Phob_G — politiques RLS

Ajoute toutes les politiques de sécurité sur les 5 tables.
Les tables ont été créées dans la migration précédente `phobg_tables`.
*/

-- ============================================
-- 1. PROFILES
-- ============================================
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. THERAPIST PROFILES
-- ============================================
DROP POLICY IF EXISTS "select_own_therapist_profile" ON therapist_profiles;
CREATE POLICY "select_own_therapist_profile" ON therapist_profiles FOR SELECT
  TO authenticated USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "insert_own_therapist_profile" ON therapist_profiles;
CREATE POLICY "insert_own_therapist_profile" ON therapist_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "update_own_therapist_profile" ON therapist_profiles;
CREATE POLICY "update_own_therapist_profile" ON therapist_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "select_assigned_therapist_profile" ON therapist_profiles;
CREATE POLICY "select_assigned_therapist_profile" ON therapist_profiles FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles
      WHERE patient_profiles.therapist_id = therapist_profiles.profile_id
      AND patient_profiles.profile_id = auth.uid()
    )
  );

-- ============================================
-- 3. PATIENT PROFILES
-- ============================================
DROP POLICY IF EXISTS "select_own_patient_profile" ON patient_profiles;
CREATE POLICY "select_own_patient_profile" ON patient_profiles FOR SELECT
  TO authenticated USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "insert_own_patient_profile" ON patient_profiles;
CREATE POLICY "insert_own_patient_profile" ON patient_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "update_own_patient_profile" ON patient_profiles;
CREATE POLICY "update_own_patient_profile" ON patient_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "select_assigned_patient_profiles" ON patient_profiles;
CREATE POLICY "select_assigned_patient_profiles" ON patient_profiles FOR SELECT
  TO authenticated USING (auth.uid() = therapist_id);

-- ============================================
-- 4. QUESTIONNAIRE SESSIONS
-- ============================================
DROP POLICY IF EXISTS "select_own_sessions" ON questionnaire_sessions;
CREATE POLICY "select_own_sessions" ON questionnaire_sessions FOR SELECT
  TO authenticated USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON questionnaire_sessions;
CREATE POLICY "insert_own_sessions" ON questionnaire_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "select_patient_sessions" ON questionnaire_sessions;
CREATE POLICY "select_patient_sessions" ON questionnaire_sessions FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles
      WHERE patient_profiles.profile_id = questionnaire_sessions.patient_id
      AND patient_profiles.therapist_id = auth.uid()
    )
  );

-- ============================================
-- 5. GAME PROGRESS
-- ============================================
DROP POLICY IF EXISTS "select_own_progress" ON game_progress;
CREATE POLICY "select_own_progress" ON game_progress FOR SELECT
  TO authenticated USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "insert_own_progress" ON game_progress;
CREATE POLICY "insert_own_progress" ON game_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "update_own_progress" ON game_progress;
CREATE POLICY "update_own_progress" ON game_progress FOR UPDATE
  TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "select_patient_progress" ON game_progress;
CREATE POLICY "select_patient_progress" ON game_progress FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles
      WHERE patient_profiles.profile_id = game_progress.patient_id
      AND patient_profiles.therapist_id = auth.uid()
    )
  );
