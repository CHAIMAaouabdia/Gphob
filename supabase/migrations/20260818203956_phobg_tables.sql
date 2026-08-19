/*
# Phob_G — schéma complet (tables uniquement)

Crée les 5 tables pour la plateforme Phob_G.
Les politiques RLS sont dans une migration séparée pour éviter
les références croisées entre tables non encore créées.
*/

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'therapist')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. THERAPIST PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS therapist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text,
  specialty text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. PATIENT PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  age_range text,
  preferred_contact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. QUESTIONNAIRE SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  phobia_type text,
  intensity integer,
  like_type text,
  recommended text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. GAME PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES questionnaire_sessions(id) ON DELETE SET NULL,
  phobia_type text NOT NULL,
  like_type text NOT NULL,
  current_level integer NOT NULL DEFAULT 0,
  total_levels integer NOT NULL DEFAULT 10,
  completed_levels jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_profile_id ON therapist_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_profile_id ON patient_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_therapist_id ON patient_profiles(therapist_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_patient_id ON questionnaire_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_patient_id ON game_progress(patient_id);
