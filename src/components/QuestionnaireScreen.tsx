import { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { QUESTIONS, PHOBIA_MAP, INTENSITY_MAP } from '@/data/questionnaire';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Header from './Header';

interface QuestionnaireScreenProps {
  onComplete: (sessionId: string, phobiaType: string, likeType: string, answers: string[]) => void;
  onBack: () => void;
}

export default function QuestionnaireScreen({ onComplete, onBack }: QuestionnaireScreenProps) {
  const { profile } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[currentQ];
  const isLast = currentQ === QUESTIONS.length - 1;
  const canProceed = answers[currentQ] !== '';

  function selectOption(value: string) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);
  }

  async function handleNext() {
    if (!isLast) { setCurrentQ((q) => q + 1); return; }
    setSaving(true);
    // New indices: phobia=0, gender=1, age=2, trigger=3, intensity=4, frequency=5,
    // avoidance=6, symptom=7, duration=8, impact=9, calming=10, like=11
    const phobiaAnswer = answers[0];
    const genderAnswer = answers[1];
    const ageAnswer = answers[2];
    const intensityAnswer = answers[4];
    const likeAnswer = answers[11];
    const phobiaInfo = PHOBIA_MAP[phobiaAnswer] || { phobiaType: 'heights', label: 'المرتفعات' };
    const intensity = INTENSITY_MAP[intensityAnswer] || 5;
    const answerIndices = answers.map((a, i) => { const idx = QUESTIONS[i].options.findIndex((o) => o.value === a); return idx >= 0 ? idx : 0; });
    const { data, error } = await supabase.from('questionnaire_sessions').insert({
      patient_id: profile?.id,
      answers: answerIndices,
      phobia_type: phobiaInfo.phobiaType,
      intensity,
      like_type: likeAnswer,
      recommended: `مسار علاجي تدريجي لمخاوف ${phobiaInfo.label}`,
    }).select().maybeSingle();
    setSaving(false);
    if (error || !data) return;

    // Update profile with gender and age if not already set
    if (profile && (genderAnswer || ageAnswer)) {
      await supabase.from('profiles').update({
        gender: genderAnswer || null,
        age_range: ageAnswer || null,
      }).eq('id', profile.id);
    }

    onComplete(data.id, phobiaInfo.phobiaType, likeAnswer, answers);
  }

  const pct = Math.round(((currentQ + 1) / QUESTIONS.length) * 100);

  return (
    <div className="min-h-[100dvh] flex flex-col anim-fade">
      <Header
        sectionLabel="الاستبيان التشخيصي"
        showNotifications={false}
        leftContent={
          <button onClick={onBack} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            رجوع
          </button>
        }
      />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto w-full flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <FileText className="w-4 h-4" />
            الاستبيان التشخيصي
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-sky-900/70 dark:text-slate-300">السؤال {currentQ + 1} من {QUESTIONS.length}</span>
              <span className="text-sm font-semibold text-sky-900 dark:text-sky-100 tabular-nums">{pct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-sky-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div key={currentQ} className="anim-fade-up">
            <h2 className="text-xl font-bold text-sky-950 dark:text-sky-50 mb-5 leading-snug">{question.text}</h2>
            <div className="space-y-3 stagger">
              {question.options.map((opt, i) => {
                const active = answers[currentQ] === opt.value;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(opt.value)}
                    className={`w-full text-right flex items-center justify-between rounded-2xl p-4 border-2 transition-all duration-200 active:scale-[0.98] ${
                      active
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 shadow-md shadow-emerald-100 dark:shadow-emerald-900/30'
                        : 'border-sky-100 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 hover:border-sky-300 dark:hover:border-slate-500 hover:bg-sky-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="font-medium text-sky-900 dark:text-sky-100">{opt.label}</span>
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${active ? 'border-emerald-400 bg-emerald-400' : 'border-sky-200 dark:border-slate-500'}`}>
                      {active && <svg viewBox="0 0 20 20" className="w-full h-full text-white" fill="currentColor"><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed || saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-white text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 enabled:shadow-lg enabled:shadow-emerald-200/60 dark:enabled:shadow-emerald-900/40"
          >
            {saving ? 'جارٍ الحفظ...' : isLast ? 'ابدأ الرحلة' : 'التالي'}
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
