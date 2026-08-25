import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'patient' | 'therapist';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  gender: string | null;
  age_range: string | null;
  created_at: string;
}

export interface TherapistProfile {
  id: string;
  profile_id: string;
  license_number: string | null;
  specialty: string | null;
  bio: string | null;
}

export interface PatientProfile {
  id: string;
  profile_id: string;
  therapist_id: string | null;
  age_range: string | null;
  preferred_contact: string | null;
}

export interface QuestionnaireSession {
  id: string;
  patient_id: string;
  answers: number[];
  phobia_type: string | null;
  intensity: number | null;
  like_type: string | null;
  recommended: string | null;
  created_at: string;
}

export interface GameProgressRow {
  id: string;
  patient_id: string;
  session_id: string | null;
  phobia_type: string;
  like_type: string;
  current_level: number;
  total_levels: number;
  completed_levels: number[];
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
}
