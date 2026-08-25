import { QUESTIONS, INTENSITY_MAP } from '@/data/questionnaire';

export interface QuestionnaireConfig {
  answers: string[];
  phobiaType: string;
  intensity: number;
  likeType: string;
  /** When fear starts: thinking, approaching, during, after */
  fearTrigger: string;
  /** Physical symptom: heartbeat, sweating, breathing, dizziness */
  symptom: string;
  /** Avoidance level: no_avoid, sometimes_avoid, often_avoid, always_avoid */
  avoidance: string;
  /** Frequency: rare, sometimes, often, daily */
  frequency: string;
  /** Calming strategy: person, music, meditation, hobby */
  calmingStrategy: string;
  /** Duration: childhood, years, months, unknown */
  duration: string;
  /** Daily impact: no_impact, slight, moderate, severe_impact */
  dailyImpact: string;
}

export function buildConfig(answers: string[]): QuestionnaireConfig {
  // New indices: phobia=0, gender=1, age=2, trigger=3, intensity=4, frequency=5,
  // avoidance=6, symptom=7, duration=8, impact=9, calming=10, like=11
  const intensity = INTENSITY_MAP[answers[4]] || 5;
  return {
    answers,
    phobiaType: answers[0] || 'heights',
    intensity,
    likeType: answers[11] || 'cats',
    fearTrigger: answers[3] || 'during',
    symptom: answers[7] || 'heartbeat',
    avoidance: answers[6] || 'sometimes_avoid',
    frequency: answers[5] || 'sometimes',
    calmingStrategy: answers[10] || 'meditation',
    duration: answers[8] || 'years',
    dailyImpact: answers[9] || 'slight',
  };
}

/** Adapts platformer difficulty based on questionnaire answers */
export function getDifficultyModifiers(config: QuestionnaireConfig) {
  // Intensity: higher = more gaps, fewer platforms
  const intensityMult = 0.5 + (config.intensity / 10) * 1.0; // 0.7 to 1.5

  // Avoidance: higher avoidance = more obstacles (patient needs gentle push)
  const avoidanceMap: Record<string, number> = { no_avoid: 0.7, sometimes_avoid: 1.0, often_avoid: 1.2, always_avoid: 1.4 };
  const avoidMult = avoidanceMap[config.avoidance] || 1.0;

  // Frequency: daily fear = more resilient, slightly easier
  const freqMap: Record<string, number> = { rare: 1.2, sometimes: 1.0, often: 0.9, daily: 0.8 };
  const freqMult = freqMap[config.frequency] || 1.0;

  // Combined difficulty multiplier for level generation
  const difficultyMult = intensityMult * avoidMult * freqMult;

  // Number of calming items on platforms (based on calming strategy preference)
  const calmingCount = 3 + Math.floor((10 - config.intensity) / 4);

  // Symptom effect intensity for visual effects
  const symptomIntensity = config.intensity / 10;

  // Speed modifier: high-impact patients get slightly slower player for control
  const impactMap: Record<string, number> = { no_impact: 1.0, slight: 1.0, moderate: 0.95, severe_impact: 0.9 };
  const speedMult = impactMap[config.dailyImpact] || 1.0;

  return {
    difficultyMult,
    calmingCount,
    symptomIntensity,
    speedMult,
    gapBase: 35 + (config.intensity * 4), // 39-75 base gap
    platformCount: Math.max(4, Math.round(8 - config.intensity * 0.4)),
  };
}

/** Returns calming item emoji and label based on strategy */
export function getCalmingItem(strategy: string): { emoji: string; label: string; color: string } {
  switch (strategy) {
    case 'person': return { emoji: '🤝', label: 'وجود شخص قريب', color: '#f472b6' };
    case 'music': return { emoji: '🎵', label: 'الموسيقى', color: '#a78bfa' };
    case 'meditation': return { emoji: '🧘', label: 'التأمّل والتنفّس', color: '#34d399' };
    case 'hobby': return { emoji: '🎨', label: 'الهواية', color: '#fbbf24' };
    default: return { emoji: '🧘', label: 'التأمّل', color: '#34d399' };
  }
}

/** Returns symptom visual effect config */
export function getSymptomEffect(symptom: string, intensity: number) {
  const strength = intensity; // 0-1
  switch (symptom) {
    case 'heartbeat':
      return { type: 'heartbeat' as const, strength, color: '#ef4444', label: 'تسارع ضربات القلب' };
    case 'sweating':
      return { type: 'sweat' as const, strength, color: '#60a5fa', label: 'تعرّق وارتجاف' };
    case 'breathing':
      return { type: 'breathing' as const, strength, color: '#f59e0b', label: 'ضيق في التنفّس' };
    case 'dizziness':
      return { type: 'dizzy' as const, strength, color: '#a78bfa', label: 'دوار أو غثيان' };
    default:
      return { type: 'heartbeat' as const, strength, color: '#ef4444', label: 'تسارع ضربات القلب' };
  }
}

/** Phobia-specific interactive objects that appear in the platformer */
export interface PhobiaObject {
  id: string;
  emoji: string;
  label: string;
  /** What happens when clicked: appears, fades, or transforms */
  interaction: 'appear' | 'fade' | 'transform';
  transformEmoji?: string;
  transformLabel?: string;
  /** Points for clicking */
  points: number;
}

export function getPhobiaObjects(phobiaType: string): PhobiaObject[] {
  switch (phobiaType) {
    case 'heights':
      return [
        { id: 'h1', emoji: '🏔️', label: 'جبل', interaction: 'appear', points: 5 },
        { id: 'h2', emoji: '🌉', label: 'جسر', interaction: 'appear', points: 5 },
        { id: 'h3', emoji: '🪂', label: 'مظلة', interaction: 'appear', points: 10 },
        { id: 'h4', emoji: '😰', label: 'خوف', interaction: 'transform', transformEmoji: '😊', transformLabel: 'ثقة', points: 15 },
      ];
    case 'spiders':
      return [
        { id: 's1', emoji: '🕷️', label: 'عنكبوت صغير', interaction: 'transform', transformEmoji: '🦋', transformLabel: 'فراشة', points: 15 },
        { id: 's2', emoji: '🕸️', label: 'بيت عنكبوت', interaction: 'fade', points: 10 },
        { id: 's3', emoji: '🍃', label: 'ورقة', interaction: 'appear', points: 5 },
        { id: 's4', emoji: '😰', label: 'خوف', interaction: 'transform', transformEmoji: '😌', transformLabel: 'هدوء', points: 15 },
      ];
    case 'enclosed':
      return [
        { id: 'e1', emoji: '🚪', label: 'باب مفتوح', interaction: 'appear', points: 5 },
        { id: 'e2', emoji: '🕳️', label: 'مخرج', interaction: 'appear', points: 10 },
        { id: 'e3', emoji: '🪟', label: 'نافذة', interaction: 'appear', points: 5 },
        { id: 'e4', emoji: '😰', label: 'خوف', interaction: 'transform', transformEmoji: '😌', transformLabel: 'طمأنينة', points: 15 },
      ];
    case 'crowds':
      return [
        { id: 'c1', emoji: '🚶', label: 'شخص', interaction: 'fade', points: 5 },
        { id: 'c2', emoji: '🌳', label: 'شجرة', interaction: 'appear', points: 5 },
        { id: 'c3', emoji: '🛤️', label: 'مسار واضح', interaction: 'appear', points: 10 },
        { id: 'c4', emoji: '😰', label: 'خوف', interaction: 'transform', transformEmoji: '😊', transformLabel: 'ثقة', points: 15 },
      ];
    default:
      return [];
  }
}
