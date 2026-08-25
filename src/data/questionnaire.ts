export interface Question {
  id: number;
  text: string;
  options: { label: string; value: string }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'ما نوع الخوف الذي يراودك أكثر من غيره؟',
    options: [
      { label: 'المرتفعات والأماكن العالية', value: 'heights' },
      { label: 'العناكب والحشرات', value: 'spiders' },
      { label: 'الأماكن المغلقة والضيقة', value: 'enclosed' },
      { label: 'الزحام والأماكن المكتظة', value: 'crowds' },
    ],
  },
  {
    id: 2,
    text: 'ما الجنس الذي تنتمي إليه؟',
    options: [
      { label: 'ذكر', value: 'male' },
      { label: 'أنثى', value: 'female' },
    ],
  },
  {
    id: 3,
    text: 'ما فئتك العمرية؟',
    options: [
      { label: 'أقل من 18', value: 'under_18' },
      { label: '18 - 25', value: '18_25' },
      { label: '26 - 35', value: '26_35' },
      { label: '36 - 50', value: '36_50' },
      { label: 'أكثر من 50', value: 'over_50' },
    ],
  },
  {
    id: 4,
    text: 'متى تبدأ مشاعر الخوف عادةً؟',
    options: [
      { label: 'عند التفكير في الموقف فقط', value: 'thinking' },
      { label: 'عند الاقتراب من الموقف', value: 'approaching' },
      { label: 'أثناء الموقف مباشرة', value: 'during' },
      { label: 'بعد انتهاء الموقف', value: 'after' },
    ],
  },
  {
    id: 5,
    text: 'ما مدى شدّة مخاوفك على مقياس من 1 إلى 10؟',
    options: [
      { label: 'خفيفة (1-3)', value: 'low' },
      { label: 'متوسطة (4-6)', value: 'medium' },
      { label: 'قوية (7-8)', value: 'high' },
      { label: 'طاغية (9-10)', value: 'severe' },
    ],
  },
  {
    id: 6,
    text: 'كم مرة يتعرّض لك هذا الخوف في حياتك اليومية؟',
    options: [
      { label: 'نادرًا (مرة في الشهر)', value: 'rare' },
      { label: 'أحيانًا (مرة في الأسبوع)', value: 'sometimes' },
      { label: 'كثيرًا (عدة مرات في الأسبوع)', value: 'often' },
      { label: 'يوميًا', value: 'daily' },
    ],
  },
  {
    id: 7,
    text: 'هل تحاول تجنّب المواقف التي تثير خوفك؟',
    options: [
      { label: 'لا، أواجهها رغم عدم الارتياح', value: 'no_avoid' },
      { label: 'أحيانًا أجنّبها', value: 'sometimes_avoid' },
      { label: 'غالبًا أجنّبها', value: 'often_avoid' },
      { label: 'دائمًا أتجنّبها نهائيًا', value: 'always_avoid' },
    ],
  },
  {
    id: 8,
    text: 'ما الأعراض الجسدية التي تظهر عليك؟',
    options: [
      { label: 'تسارع ضربات القلب', value: 'heartbeat' },
      { label: 'تعرّق وارتجاف', value: 'sweating' },
      { label: 'ضيق في التنفّس', value: 'breathing' },
      { label: 'دوار أو غثيان', value: 'dizziness' },
    ],
  },
  {
    id: 9,
    text: 'منذ متى وأنت تعاني من هذا الخوف؟',
    options: [
      { label: 'منذ الطفولة', value: 'childhood' },
      { label: 'منذ بضع سنوات', value: 'years' },
      { label: 'منذ بضعة أشهر', value: 'months' },
      { label: 'لا أذكر بالتحديد', value: 'unknown' },
    ],
  },
  {
    id: 10,
    text: 'هل يؤثر خوفك على أنشطتك اليومية؟',
    options: [
      { label: 'لا تأثير يُذكر', value: 'no_impact' },
      { label: 'تأثير بسيط', value: 'slight' },
      { label: 'تأثير ملحوظ', value: 'moderate' },
      { label: 'تأثير كبير يحدّ من نشاطي', value: 'severe_impact' },
    ],
  },
  {
    id: 11,
    text: 'ما الذي يمنحك طمأنينة عند الشعور بالخوف؟',
    options: [
      { label: 'وجود شخص قريب', value: 'person' },
      { label: 'الاستماع للموسيقى', value: 'music' },
      { label: 'التأمّل والتنفّس', value: 'meditation' },
      { label: 'ممارسة هواية محبّبة', value: 'hobby' },
    ],
  },
  {
    id: 12,
    text: 'ما الذي تحبّه وتودّ أن يكون جزءًا من رحلة العلاج؟',
    options: [
      { label: 'القطط', value: 'cats' },
      { label: 'الكلاب', value: 'dogs' },
      { label: 'الطبيعة', value: 'nature' },
      { label: 'الرياضة', value: 'sport' },
      { label: 'الموسيقى', value: 'music' },
    ],
  },
];

export const PHOBIA_MAP: Record<string, { phobiaType: string; label: string }> = {
  heights: { phobiaType: 'heights', label: 'المرتفعات' },
  spiders: { phobiaType: 'spiders', label: 'العناكب' },
  enclosed: { phobiaType: 'enclosed', label: 'الأماكن المغلقة' },
  crowds: { phobiaType: 'crowds', label: 'الزحام' },
};

export const INTENSITY_MAP: Record<string, number> = {
  low: 2,
  medium: 5,
  high: 7,
  severe: 9,
};
