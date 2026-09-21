import { useMemo } from 'react';
import { BookOpen, Glasses, ChevronLeft, ChevronRight, Sparkles, Clock, Target, Heart, Wind, Brain } from 'lucide-react';
import Header from './Header';
import { getOrCreatePhobia, type PhobiaId, type LikeId, LIKES } from '@/data/journey';
import type { QuestionnaireConfig } from '@/data/gameConfig';

interface ScenarioChoiceScreenProps {
  phobiaType: string;
  customPhobiaLabel?: string;
  likeType: string;
  config: QuestionnaireConfig;
  onChooseImagination: () => void;
  onChooseVR: () => void;
  onBack: () => void;
}

export default function ScenarioChoiceScreen({ phobiaType, customPhobiaLabel, likeType, config, onChooseImagination, onChooseVR, onBack }: ScenarioChoiceScreenProps) {
  const phobia = useMemo(
    () => getOrCreatePhobia(phobiaType as PhobiaId, customPhobiaLabel, likeType as LikeId, { intensity: config.intensity, calmingStrategy: config.calmingStrategy, symptom: config.symptom }),
    [phobiaType, customPhobiaLabel, likeType, config],
  );
  const like = LIKES.find((l) => l.id === likeType);

  const intensityLabel = config.intensity <= 3 ? 'خفيفة' : config.intensity <= 6 ? 'متوسطة' : config.intensity <= 8 ? 'قوية' : 'طاغية';

  const symptomLabels: Record<string, string> = {
    heartbeat: 'تسارع ضربات القلب',
    sweating: 'تعرّق وارتجاف',
    breathing: 'ضيق في التنفّس',
    dizziness: 'دوار أو غثيان',
  };

  const calmingLabels: Record<string, string> = {
    person: 'وجود شخص قريب',
    music: 'الاستماع للموسيقى',
    meditation: 'التأمّل والتنفّس',
    hobby: 'ممارسة هواية',
  };

  return (
    <div className="min-h-[100dvh] flex flex-col anim-fade">
      <Header
        sectionLabel="السيناريو المخصّص"
        leftContent={
          <button onClick={onBack} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            رجوع
          </button>
        }
      />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          {/* Header */}
          <div className="text-center anim-fade-up">
            <div className="anim-float inline-flex mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 dark:from-sky-600 dark:to-emerald-600 flex items-center justify-center shadow-lg shadow-sky-200/50 dark:shadow-sky-900/40">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-sky-950 dark:text-sky-50">تم إنشاء سيناريو العلاج</h1>
            <p className="mt-2 text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed">
              بناءً على إجاباتك، صمّمنا لك مسارًا تدريجيًا من 10 مستويات للتعرّض العلاجي. اختر طريقة اجتياز الرحلة.
            </p>
          </div>

          {/* Scenario summary card */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6 anim-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-sky-950 dark:text-sky-50">ملخّص السيناريو المخصّص</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">نوع الخوف</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{phobia.emoji} {phobia.label}</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">الرفيق</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{like?.emoji} {like?.label}</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">شدّة الخوف</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{intensityLabel} ({config.intensity}/10)</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">الأعراض</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{symptomLabels[config.symptom] || '—'}</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">استراتيجية التهدئة</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{calmingLabels[config.calmingStrategy] || '—'}</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">عدد المستويات</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">10 مستويات تدريجية</p>
              </div>
            </div>
          </div>

          {/* Scenario narrative */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6 anim-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              <h2 className="text-base font-bold text-sky-950 dark:text-sky-50">السيناريو الكامل</h2>
            </div>
            <div className="rounded-xl bg-sky-50/60 dark:bg-slate-700/30 p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-sky-900/90 dark:text-slate-200 leading-loose whitespace-pre-line">
                {phobia.levels.map((lvl, i) => `${i + 1}. ${lvl.scene}`).join('\n\n')}
              </p>
            </div>
            <p className="mt-3 text-xs text-sky-500 dark:text-slate-400 leading-relaxed">
              هذا النص يتحوّل تلقائيًا إلى مشاهد مرئية متحرّكة عند اختيار وضع الواقع الافتراضي وربط النظارات.
            </p>
          </div>

          {/* Mode choice */}
          <div className="anim-fade-up">
            <h2 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-4 text-center">اختر طريقة اجتياز الرحلة</h2>
            <div className="grid grid-cols-1 gap-4">
              {/* Imagination mode */}
              <button
                onClick={onChooseImagination}
                className="group flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 p-5 text-right shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-xl bg-sky-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-0.5">رحلة الخيال</h3>
                  <p className="text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed">اقرأ المشهد، تأمّل الصورة، وعش التجربة في خيالك خطوة بخطوة بأسلوب التعرّض التخيّلي</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-sky-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> تعرّض تخيّلي</span>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {like?.emoji} رفيقك معك</span>
                  </div>
                </div>
                <ChevronLeft className="w-6 h-6 flex-shrink-0 text-sky-400 group-hover:-translate-x-1 transition-transform" />
              </button>

              {/* VR mode */}
              <button
                onClick={onChooseVR}
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 dark:from-sky-600 dark:to-emerald-600 p-5 text-white text-right shadow-lg shadow-sky-200/40 dark:shadow-sky-900/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Glasses className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-0.5">تجربة الواقع الافتراضي</h3>
                  <p className="text-sm text-white/85 leading-relaxed">شاهد سيناريو غامرًا ثلاثي الأبعاد مصمّمًا خصيصًا لإجاباتك، مع تعرّض بصري تدريجي في بيئة آمنة</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
                    <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> تعرّض غامر</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~25 دقيقة</span>
                  </div>
                </div>
                <ChevronLeft className="w-6 h-6 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
