import {
  Sparkles,
  ArrowLeft,
  Brain,
  Target,
  Trophy,
  Layers,
  Shield,
  CheckCircle2,
  PlayCircle,
  LogIn,
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
  onStart: () => void;
  onSignIn: () => void;
}

const FEATURES = [
  { icon: Target, title: 'تعرّض تدريجي', desc: '10 مستويات متصاعدة الشدة، كل مستوى خطوة صغيرة وآمنة نحو مواجهة مخاوفك.' },
  { icon: Sparkles, title: 'مشاهد مخصّصة', desc: 'تُدمج اهتماماتك المحبوبة في القصة لتصبح التغلب على الخوف رحلة ممتعة لا عبئًا.' },
  { icon: Trophy, title: 'مكافآت فورية', desc: 'نجوم تضيء ورسائل تشجيع بعد كل مستوى، تعزّز ثقتك خطوة بخطوة.' },
  { icon: Brain, title: 'منهج علمي', desc: 'مبني على مبدأ التعرّض التدريجي المعرفي السلوكي، بطريقة مبتكرة وتفاعلية.' },
];

const STEPS = [
  { num: '١', title: 'أنشئ حسابك', desc: 'سجّل كمريض أو كمعالج في ثوانٍ.' },
  { num: '٢', title: 'اجب عن الاستبيان', desc: '10 أسئلة تشخيصية تحدد نوع الخوف وشدّته.' },
  { num: '٣', title: 'اعبر المستويات', desc: '10 مستويات تدريجية بمشاهد مصوّرة ومهام بسيطة ومكافآت.' },
  { num: '٤', title: 'تابع تقدّمك', desc: 'لوحة تحكم تعرض إنجازك، ويمكن للمعالج متابعتك أيضًا.' },
];

const PHOBIAS_LIST = [
  { emoji: '🏔️', label: 'المرتفعات' },
  { emoji: '🕷️', label: 'العناكب' },
  { emoji: '🚪', label: 'الأماكن المغلقة' },
  { emoji: '👥', label: 'الزحام' },
];

export default function LandingPage({ onStart, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-[100dvh] anim-fade">
      {/* Top bar with logo + theme toggle */}
      <div className="absolute top-4 right-4 left-4 flex items-center justify-between z-20">
        <Logo size={40} showText textClassName="text-xl text-sky-950 dark:text-sky-100" />
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 to-transparent dark:from-sky-900/20 dark:to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="anim-float inline-flex mb-6">
            <Logo size={80} />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-sm font-semibold mb-5 anim-fade-up">
            طريقة مبتكرة لعلاج المخاوف
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold text-sky-950 dark:text-sky-50 tracking-tight anim-fade-up">
            Phob<span className="text-emerald-500">_</span>G
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed anim-fade-up">
            واجه مخاوفك خطوة بخطوة، بعيدًا عن العنف والقفز
          </p>
          <p className="mt-2 text-base text-sky-700/80 dark:text-slate-300 leading-relaxed anim-fade-up">
            حلٌّ سريري عملي ومبتكر — يعرّضك تدريجيًا لمخاوفك عبر مشاهد مخصّصة،
            مع مكافآت تتبع اهتماماتك، في 10 مستويات متصاعدة.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 anim-fade-up">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 px-9 py-4 text-white text-lg font-semibold shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40 anim-glow"
            >
              <PlayCircle className="w-6 h-6" />
              ابدأ رحلتك الآن
            </button>
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-slate-600 hover:border-sky-300 dark:hover:border-slate-500 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all duration-200 px-7 py-4 text-sky-800 dark:text-sky-200 text-base font-semibold"
            >
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </button>
          </div>

          <p className="mt-5 text-xs text-sky-700/50 dark:text-slate-400 max-w-xs mx-auto leading-relaxed anim-fade-up">
            نموذج أولي تجريبي — لا يحل محل الاستشارة الطبية المتخصّصة.
          </p>
        </div>
      </section>

      {/* Slogan banner */}
      <section className="px-6 py-6">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 px-6 py-5 text-center shadow-lg shadow-sky-200/40 dark:shadow-sky-900/40 anim-scale">
          <p className="text-white text-lg font-bold leading-relaxed">
            «Phob_G — حين يصبح التدرّج دواءً، والمكافأة شفاءً»
          </p>
        </div>
      </section>

      {/* Concept */}
      <section className="px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-8 shadow-sm anim-scale">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-2xl font-bold text-sky-950 dark:text-sky-50">حلٌّ سريري عملي</h2>
            </div>
            <p className="text-sky-900/85 dark:text-slate-200 leading-relaxed text-lg">
              تطبيق يعرّض شخصًا تدريجيًا لمخاوفه، عبر مشاهد مخصّصة، مع مكافآت
              مرتبطة باهتماماته، في 10 مستويات متصاعدة الشدة.
            </p>
            <p className="mt-4 text-sm text-sky-700/60 dark:text-slate-400 leading-relaxed">
              ليست فكرة مستقبلية ولا عرضًا تسويقيًا — إنها طريقة علاج مبتكرة
              يمكنك تجربتها الآن، خطوة صغيرة في كل مرة. مع لوحات تحكم للمرضى
              والمعالجين على حدّ سواء.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-sky-950 dark:text-sky-50 text-center mb-10">
            كيف يعمل Phob_G؟
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 stagger">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6 hover:shadow-md hover:shadow-sky-100 dark:hover:shadow-slate-900/50 transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-2">{f.title}</h3>
                <p className="text-sky-800/75 dark:text-slate-300 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-14 bg-gradient-to-b from-transparent to-sky-50/50 dark:to-slate-900/40">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-sky-950 dark:text-sky-50 text-center mb-10">
            رحلتك في 4 خطوات
          </h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="flex items-start gap-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-5 anim-fade-up"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-bold text-sky-950 dark:text-sky-50 mb-1">{s.title}</h3>
                  <p className="text-sky-800/75 dark:text-slate-300 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phobias covered */}
      <section className="px-6 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-sky-950 dark:text-sky-50 mb-3">المخاوف التي يعالجها</h2>
          <p className="text-sky-800/70 dark:text-slate-400 mb-8">10 مستويات لكل نوع</p>
          <div className="flex flex-wrap justify-center gap-4 stagger">
            {PHOBIAS_LIST.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-2 rounded-full bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 px-6 py-3"
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-semibold text-sky-900 dark:text-sky-100">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why innovative */}
      <section className="px-6 py-14 bg-gradient-to-b from-sky-50/50 dark:from-slate-900/40 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-emerald-600 p-8 text-white shadow-xl shadow-sky-200/50 dark:shadow-sky-900/40 anim-scale">
            <div className="flex items-center gap-3 mb-5">
              <Layers className="w-7 h-7" />
              <h2 className="text-2xl font-bold">ما الذي يجعلها مبتكرة؟</h2>
            </div>
            <ul className="space-y-3">
              {[
                'تعرّض تدريجي محسوب بدقة علمية بدل القفز نحو الخوف دفعة واحدة',
                'تخصيص المشاهد باهتماماتك يحوّل العلاج من عبء إلى رحلة ممتعة',
                'مكافآت فورية تعيد تدعيم الدماغ وتزرع الثقة بعد كل خطوة',
                'لوحات تحكم للمرضى والمعالجين لمتابعة التقدّم بشكل منظّم',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" />
                  <span className="text-white/95 leading-relaxed text-[15px]">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-md mx-auto anim-fade-up">
          <div className="anim-float inline-flex mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-sky-950 dark:text-sky-50 mb-4">جاهز للبدء؟</h2>
          <p className="text-sky-800/75 dark:text-slate-300 mb-8 leading-relaxed">
            رحلتك نحو مواجهة مخاوفك تبدأ بخطوة واحدة صغيرة. آمنة، تدريجية،
            وخاصة بك.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 px-9 py-4 text-white text-lg font-semibold shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40 anim-glow"
          >
            ابدأ رحلتك الآن
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="px-6 py-8 text-center border-t border-sky-100/60 dark:border-slate-700/60">
        <p className="text-xs text-sky-700/50 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          Phob_G — نموذج أولي تجريبي لعرض مفهوم العلاج بالتعرّض التدريجي. لا
          يُستخدم كبديل للعلاج الطبي المتخصّص.
        </p>
      </footer>
    </div>
  );
}
