export type PhobiaId = 'heights' | 'spiders' | 'enclosed' | 'crowds';
export type LikeId = 'cats' | 'dogs' | 'nature' | 'sport' | 'music';

export interface Level {
  index: number;
  title: string;
  scene: string;
  mission: string;
  image: string;
  alt: string;
  encouragement: string;
}

export interface Phobia {
  id: PhobiaId;
  label: string;
  emoji: string;
  levels: Level[];
}

export const PHOBIAS: Phobia[] = [
  {
    id: 'heights',
    label: 'المرتفعات',
    emoji: '🏔️',
    levels: [
      {
        index: 0,
        title: 'المستوى 1 · أسفل المبنى',
        scene:
          'أنت تقف أسفل مبنى شاهق. ترتفع بصرك ببطء نحو الأعلى. السماء زرقاء وهادئة فوق الواجهات.',
        mission:
          'هرّة صغيرة عالقة في الأعلى، طابقًا بعد طابق. اليوم، ابقَ أسفل المبنى وتنفّس ثلاث مرات وأنت تنظر نحو الأعلى.',
        image:
          'https://images.pexels.com/photos/38823578/pexels-photo-38823578.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'نظر من أسفل إلى مبنى شاهق ضد سماء زرقاء',
        encouragement: 'أطلقت النظرة الأولى. أنت حاضر، وهذا بداية كافية.',
      },
      {
        index: 1,
        title: 'المستوى 2 · التلة الهادئة',
        scene:
          'تصعد تلة عشبية. المنحدر لطيف، والهواء منعش. في القمة، ينفتح المشهد على الوادي.',
        mission:
          'الهرّة تسلّقت شجرة في منتصف التلة. اقترب من نقطة المشاهدة ودع بصرك يجول الأفق.',
        image:
          'https://images.pexels.com/photos/17717285/pexels-photo-17717285.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'تلة خضراء هادئة بإطلالة على الوادي',
        encouragement: 'ترتقي بنعومة. الارتفاع لا يزال بعيدًا، وأت صامدًا.',
      },
      {
        index: 2,
        title: 'المستوى 3 · نافذة الطابق العالي',
        scene:
          'تقف أمام نافذة في طابق مرتفع. الزجاج بينك وبين الخارج، والمدينة تتمدد في الأسفل تحت ضوء الغروب.',
        mission:
          'الهرّة تجلس على حافة النافذة المجاورة. ضع يديك على الزجاج وعدّ ثلاثة أشياء تراها في الأفق.',
        image:
          'https://images.pexels.com/photos/3550655/pexels-photo-3550655.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'منظر مدينة من نافذة طابق مرتفع',
        encouragement: 'أنت في ارتفاع وتبقى متماسك. عمل ممتاز.',
      },
      {
        index: 3,
        title: 'المستوى 4 · الشرفة',
        scene:
          'تخرج إلى شرفة في شقة. الدرابزين صلب أمامك، والمدينة تتدرّج في الأسفل تحت شمس الغروب.',
        mission:
          'الهرّة على الشرفة المجاورة. ضع يديك على الدرابزين وعدّ ثلاثة أشياء تراها في البعيد.',
        image:
          'https://images.pexels.com/photos/8089094/pexels-photo-8089094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'شرفة عالية بإطلالة على المدينة عند الغروب',
        encouragement: 'أنت في ارتفاع وتبقى متماسك. أحسنت.',
      },
      {
        index: 4,
        title: 'المستوى 5 · منصة المشاهدة الزجاجية',
        scene:
          'تقف على منصة مشاهدة زجاجية في برج. المدينة تحت قدميك عبر الأرضية الشفافة، لكن الزجاج يحملك.',
        mission:
          'الهرّة تتنقّل بثقة على المنصة. انظر إلى الأسفل عبر الزجاج لثانيتين، ثم ارفع بصرك للأفق.',
        image:
          'https://images.pexels.com/photos/16117376/pexels-photo-16117376.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'منصة مشاهدة زجاجية في برج شاهق',
        encouragement: 'نظرت إلى الأسفل وبقيت ثابتًا. نصف الطريق الآن.',
      },
      {
        index: 5,
        title: 'المستوى 6 · ممر السلسلة',
        scene:
          'جسر معلّق يمتد فوق وادٍ عميق. الألواح الخشبية تتأرجح قليلاً، لكن السلاسل قوية والطريق واضح.',
        mission:
          'الهرّة تعبر أمامك بخطوات واثقة. خطُ خطوة على الجسر وأنت تتبع تنفّسك.',
        image:
          'https://images.pexels.com/photos/9930905/pexels-photo-9930905.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'جسر معلّق فوق وادٍ مشجّر',
        encouragement: 'العبر تحتك وبقيت تسير. شجاعتك تنمو.',
      },
      {
        index: 6,
        title: 'المستوى 7 · مسار الكتف',
        scene:
          'مسار ضيق يمتد على كتف جبل. صخر من جهة، وفراغ واسع صامت من الجهة الأخرى.',
        mission:
          'الهرّة على نتوء صخري قريب من الحافة. تقدّم خطوة بخطوة على المسار وأنت تتبع نَفَسَك.',
        image:
          'https://images.pexels.com/photos/4119944/pexels-photo-4119944.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'مسار جبلي ضيق قرب حافة منحدر',
        encouragement: 'الفراغ لم يعد جدارًا، بل فضاء. أنت تتقدّم.',
      },
      {
        index: 7,
        title: 'المستوى 8 · التلفريك',
        scene:
          'تجلس في عربة تلفريك ترتفع فوق الجبال. الأرض تبتعد ببطء، والأشجار تتحول إلى نقاط خضراء.',
        mission:
          'الهرّة بجانبك تطلّ من النافذة بهدوء. ابقَ جالسًا ودع بصرك يتأمل الاتساع.',
        image:
          'https://images.pexels.com/photos/11678454/pexels-photo-11678454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عربة تلفريك فوق جبال وعرة',
        encouragement: 'ترتفع ولا تقاوم. أنت في عهد مع الارتفاع.',
      },
      {
        index: 8,
        title: 'المستوى 9 · قمة الجبل',
        scene:
          'تبلغ قمة جبل. في الأسفل، الوادي والغيوم. الارتفاع لم يعد تهديدًا: إنه مشهد.',
        mission:
          'الهرّة بجانبك، تحتمي بك. تأمل الـ360 درجة وابقَ دقيقة كاملة بثبات وفخر.',
        image:
          'https://images.pexels.com/photos/28829672/pexels-photo-28829672.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'بانوراما من قمة جبل مع وديان وغيوم',
        encouragement: 'بلغت القمة. الارتفاع صار ملكك.',
      },
      {
        index: 9,
        title: 'المستوى 10 · التحليق',
        scene:
          'تحلّق في المظلة فوق القمم الثلجية. الهواء يحملك، والارتفاع تحتيك لا حدود له — وأنت حر.',
        mission:
          'الهرّة في خيالك تحلّق معك. تنفّس بعمق واشعر بالحرية في هذا الاتساع.',
        image:
          'https://images.pexels.com/photos/416731/pexels-photo-416731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'مظلة تحلّق فوق قمم ثلجية',
        encouragement: 'تحلّق فوق مخاوفك. أكملت كل المستويات.',
      },
    ],
  },
  {
    id: 'spiders',
    label: 'العناكب',
    emoji: '🕷️',
    levels: [
      {
        index: 0,
        title: 'المستوى 1 · البيت من بعيد',
        scene:
          'في الحديقة، بيتُ عنكبوت معلّق بين الأغصان يلمع تحت الندى. العنكبوت صغير، شبه خفيّ.',
        mission:
          'هرّة تلعب قرب البيت بلا اكتراث. راقب البيت من بعيد، دون اقتراب، لثلاث تنفّسات.',
        image:
          'https://images.pexels.com/photos/26288658/pexels-photo-26288658.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'بيت عنكبوت مع قطرات الندى على أوراق خضراء',
        encouragement: 'وضعت النظرة الأولى. لا شيء يتحرك. أنت بأمان.',
      },
      {
        index: 1,
        title: 'المستوى 2 · على الورقة',
        scene:
          'عنكبوت صغير مشعر جاثم على ورقة خضراء على بُعد خطوات. يبقى ساكنًا، يتشرّب الشمس.',
        mission:
          'الهرّة تشمّه بفضول. تقدّم خطوة، ثم ابقَ ساكنًا وراقب أرجله الدقيقة.',
        image:
          'https://images.pexels.com/photos/28285074/pexels-photo-28285074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عنكبوت صغير مشعر على ورقة خضراء',
        encouragement: 'أصغر مما ظننت. أنت صامد.',
      },
      {
        index: 2,
        title: 'المستوى 3 · تفاصيل البيت',
        scene:
          'قطرات الندى على خيوط البيت تكسوها ألوان قوس قزح. العنكبوت يتحرك بين الخيوط ببطء.',
        mission:
          'الهرّة تراقب بجانبك. اقترب وركّز على خيط واحد من البيت واتبع حركته.',
        image:
          'https://images.pexels.com/photos/13691366/pexels-photo-13691366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'بيت عنكبوت لامع بألوان قوس قزح في ضوء الشمس',
        encouragement: 'التفاصيل لا تخيف. تراه كما هو.',
      },
      {
        index: 3,
        title: 'المستوى 4 · قريب على الجدار',
        scene:
          'عنكبوت صغير على جدار أبيض، قريب منك. ساكن، لا يقترب منك ولا يبتعد.',
        mission:
          'الهرّة تجلس قرب الجدار مطمئنة. ابقَ على مسافة ذراع وراقب ثباته.',
        image:
          'https://images.pexels.com/photos/35033944/pexels-photo-35033944.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عنكبوت صغير ساكن على جدار أبيض',
        encouragement: 'قريب منك وبقيت ثابتًا. أحسنت.',
      },
      {
        index: 4,
        title: 'المستوى 5 · في الزاوية المظلمة',
        scene:
          'عنكبوت ينسج بيته في زاوية، بإضاءة خلفية. التباين يجعل صورته واضحة، شبه أنيقة.',
        mission:
          'الهرّة نائمة بجانبه مطمئنة. ابقَ ساكنًا أمام البيت وتبع بناظرك عمله الصبور.',
        image:
          'https://images.pexels.com/photos/9150658/pexels-photo-9150658.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'صورة ظلية عنكبوت في بيته بإضاءة خلفية',
        encouragement: 'الظلّ أقل تخويفًا مما خشيت. نصف الطريق الآن.',
      },
      {
        index: 5,
        title: 'المستوى 6 · وجهًا لوجه',
        scene:
          'أنت على مستوى العنكبوت، كل أرجله مرئية، في وضح النهار. يبقى هادئًا، بلا تهديد.',
        mission:
          'الهرّة تشمّه بهدوء. ضع نظرك عليه دقيقة كاملة، ثم اشكره في سرك.',
        image:
          'https://images.pexels.com/photos/32401969/pexels-photo-32401969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عنكبوت كبير ساكن في وضح النهار',
        encouragement: 'تنظر إليه في عينه. الخوف يتراجع، الفضول يبقى.',
      },
      {
        index: 6,
        title: 'المستوى 7 · الرتيلاء',
        scene:
          'عنكبوت رتيلاء مشعر جاثم على سطح خشبي. أكبر وأوضح، لكنه لا يتحرك نحوك.',
        mission:
          'الهرّة تراقب من بعيد. ابقَ على مسافة مريحة وراقب فروه وتفاصيله.',
        image:
          'https://images.pexels.com/photos/29094532/pexels-photo-29094532.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عنكبوت رتيلاء مشعر على سطح خشبي',
        encouragement: 'أكبر من سابقيه وأنت لا تتراجع. شجاعة.',
      },
      {
        index: 7,
        title: 'المستوى 8 · على يدك',
        scene:
          'عنكبوت صغير يسير على راحة يدك. خفيف كنسمة، لا يلدغ، فقط يعبر.',
        mission:
          'تخيّل الهرّة تلمسه بكسوها الناعم. ابقَ يدك ثابتة وراقب مسيره.',
        image:
          'https://images.pexels.com/photos/21273795/pexels-photo-21273795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عنكبوت صغير على ورقة على راحة اليد',
        encouragement: 'لمسته ولم يصبك بشيء. الخوف يذوب.',
      },
      {
        index: 8,
        title: 'المستوى 9 · صغار العناكب',
        scene:
          'صغار عنكبوت تخرج من كيس البيض على شبكة. كائنات دقيقة تتحرك معًا، لا تؤذي.',
        mission:
          'الهرّة تراقبها بفضول. تأمل حركتها الجماعية لدقيقة كاملة.',
        image:
          'https://images.pexels.com/photos/36921475/pexels-photo-36921475.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'صغار عناكب تخرج من كيس البيض على شبكة',
        encouragement: 'رأيت بدايتها. الحياة لا تخيفك.',
      },
      {
        index: 9,
        title: 'المستوى 10 · مجموعة عناكب',
        scene:
          'مجموعة عناكب تتعايش في زاوية حديقة. صورة قد تكون مزعجة — لكنك الآن تنظر إليها بثبات.',
        mission:
          'الهرّة تسترخي وسطها. تنفّس بعمق واقرأ بقلبك: "أنا بأمان وسط ما كنت أخافه."',
        image:
          'https://images.pexels.com/photos/37874760/pexels-photo-37874760.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عنكبوت بني على سطح خشبي',
        encouragement: 'أنفت وسط ما كنت تخافه. أكملت كل المستويات.',
      },
    ],
  },
  {
    id: 'enclosed',
    label: 'الأماكن المغلقة',
    emoji: '🚪',
    levels: [
      {
        index: 0,
        title: 'المستوى 1 · الركن الدافئ',
        scene:
          'أنت في صالون صغير دافئ، غرق بالضوء. كرسي ووسائد ونافذة مفتوحة قريبة جدًا.',
        mission:
          'هرّة تتجعّد في الكرسي. اجلس معها وتنفّس ثلاث مرات وأنت تشعر بالهواء يدور.',
        image:
          'https://images.pexels.com/photos/27817983/pexels-photo-27817983.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'ركن قراءة دافئ مع كرسي ووسائد ونافذة مفتوحة',
        encouragement: 'مساحة صغيرة، نعم. لكنها دافئة ومفتوحة. تتنفّس بحرية.',
      },
      {
        index: 1,
        title: 'المستوى 2 · الزقاق الضيق',
        scene:
          'تمشي في زقاق مرصوف، محصور بين جدارين قديمين. السماء الزرقاء تبقى مرئية فوقك.',
        mission:
          'الهرّة تقفز من باب إلى باب أمامك. تقدّم ببطء وأنت تتبع خط الضوء فوقك.',
        image:
          'https://images.pexels.com/photos/38117088/pexels-photo-38117088.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'زقاق مرصوف ضيق بين مبانٍ حجرية قديمة',
        encouragement: 'الجدران تحيط بك والسماء تبقى. تتقدّم.',
      },
      {
        index: 2,
        title: 'المستوى 3 · الخيمة',
        scene:
          'تجلس في خيمة صغيرة، الباب مفتوح. النجوم تظهر، ونسيم الغابة منعش.',
        mission:
          'الهرّة تتجعّد ضدك. ابقَ في هذا المكان الصغير، وعينك على الفتحة المفتوحة على السماء.',
        image:
          'https://images.pexels.com/photos/2526025/pexels-photo-2526025.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'خيام تخييم مضيئة تحت سماء مرصّعة بالنجوم',
        encouragement: 'المساحة تضيق وأنت هادئ. إنه شرنقة، لا قفص.',
      },
      {
        index: 3,
        title: 'المستوى 4 · كابينة الهاتف',
        scene:
          'تقف داخل كابينة هاتف صغيرة. الجدران زجاجية، ترى الخارج بوضوح.',
        mission:
          'الهرّة تنظر إليك من الخارج. ابقَ داخل الكابينة لدقيقة وأنت ترى العالم من حولك.',
        image:
          'https://images.pexels.com/photos/37992863/pexels-photo-37992863.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'كابينة هاتف صغيرة في عشب أخضر',
        encouragement: 'محاصر لكنك ترى كل شيء. تبقى مطمئنًا.',
      },
      {
        index: 4,
        title: 'المستوى 5 · النفق',
        scene:
          'نفق من حجر يمتد أمامك. الضوء من الجهة الأخرى، بعيد لكنه واضح، يهدي خطواتك.',
        mission:
          'الهرّة تخطو أمامك نحو المخرج. تقدّم خطوة بخطوة وأنت تتبع نقطة الضوء التي تكبر.',
        image:
          'https://images.pexels.com/photos/37672449/pexels-photo-37672449.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'نفق حجري قديم بضوء في نهايته',
        encouragement: 'نهاية النفق مرئية. كل خطوة تقربه. نصف الطريق الآن.',
      },
      {
        index: 5,
        title: 'المستوى 6 · المصعد',
        scene:
          'أنت في مصعد، الأبواب مغلقة. مرآة تعكس هدوءك. الطوابق تمر بنعومة.',
        mission:
          'الهرّة بين ذراعيك. ابقَ ساكنًا، ركّز نظرك في المرآة وعدّ الثواني حتى تفتح الأبواب.',
        image:
          'https://images.pexels.com/photos/3986947/pexels-photo-3986947.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'شخص هادئ في مصعد ينظر لانعكاسه في المرآة',
        encouragement: 'مساحة ضيقة، صمت، أنت. صمدت حتى النهاية.',
      },
      {
        index: 6,
        title: 'المستوى 7 · مقصورة الطائرة',
        scene:
          'تجلس في مقصورة طائرة. مساحة محدودة، لكن النافذة تكشف السماء الواسعة.',
        mission:
          'الهرّة على حضنك. ركّز على الأفق عبر النافذة وتنفّس بعمق ثلاث مرات.',
        image:
          'https://images.pexels.com/photos/36016234/pexels-photo-36016234.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'مقصورة طائرة فارغة بنافذة تطل على سماء مشرقة',
        encouragement: 'محصور في الجو لكنك حرّ في النظر.',
      },
      {
        index: 7,
        title: 'المستوى 8 · ممر صخري ضيق',
        scene:
          'ممر صخري ضيق داخل كهف. الجدران قريبة من كتفيك، لكن الضوء الطبيعي يتسلل من الأمام.',
        mission:
          'الهرّة تعبر أمامك بسلاسة. اخترق الممر خطوة بخطوة وأنت تتبع بصرك نحو الضوء.',
        image:
          'https://images.pexels.com/photos/11849756/pexels-photo-11849756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'ممر صخري ضيق في كهف بضوء طبيعي',
        encouragement: 'الضيق يشتد وأنت تتقدّم. شجاعتك تسبق خوفك.',
      },
      {
        index: 8,
        title: 'المستوى 9 · غرفة بلا نوافذ',
        scene:
          'أنت في غرفة صغيرة بلا نوافذ. مصباح واحد يضيء. الباب أمامك، مغلق لكنه يفتح بسهولة.',
        mission:
          'الهرّة جاثمة بسلام. تنفّس ببطء وعدّ خمس ثوانٍ شهيق وخمس زفير حتى تشعر بالطمأنينة.',
        image:
          'https://images.pexels.com/photos/31375978/pexels-photo-31375978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'شخص وحيد في غرفة مظلمة قرب باب',
        encouragement: 'لا نوافذ وأنت لا تذعر. صمودك مذهل.',
      },
      {
        index: 9,
        title: 'المستوى 10 · جهاز الرنين المغناطيسي',
        scene:
          'أنت داخل أنبوب فحص الرنين المغناطيسي. فضاء ضيق جدًا، لكنه آمن ومنظّم وأنت محاط برعاية.',
        mission:
          'الهرّة في خيالك مطمئنة. أغمض عينيك وتنفّس بإيقاع ثابت حتى تشعر أن هذا المكان يحملك لا يحبسك.',
        image:
          'https://images.pexels.com/photos/7089013/pexels-photo-7089013.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'غرفة فحص رنين مغناطيسي حديثة',
        encouragement: 'أشدّ ضيق وأنت ثابت. أكملت كل المستويات.',
      },
    ],
  },
  {
    id: 'crowds',
    label: 'الزحام',
    emoji: '👥',
    levels: [
      {
        index: 0,
        title: 'المستوى 1 · في الحديقة',
        scene:
          'أشخاص قلائل يستمتعون بالحديقة، متناثرون على العشب. المساحة حولك واسعة ومفتوحة.',
        mission:
          'هرّة تسترخي هنا طوعًا. ابقَ جالسًا وراقب الأشكال بلا أن تتبعها بناظرك.',
        image:
          'https://images.pexels.com/photos/35652755/pexels-photo-35652755.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'مجموعة أصدقاء في نزهة بحديقة خضراء',
        encouragement: 'الزحام ليس إلا مجموعة. أنت راسخ.',
      },
      {
        index: 1,
        title: 'المستوى 2 · السوق',
        scene:
          'سوق ملوّن يعجّ بالزائرين بين الأكشاك. يمشي الناس ويتحدثون، الجو حيوي لكنه سلمي.',
        mission:
          'الهرّة تتسلل بين الأرجل. تقدّم ببطء في التيان وأنت تحافظ على إيقاع تنفّسك.',
        image:
          'https://images.pexels.com/photos/30426343/pexels-photo-30426343.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'سوق خارجي ملوّن بأكشاك وزائرين',
        encouragement: 'العالم ينبض حولك. أنت تبقى أنت.',
      },
      {
        index: 2,
        title: 'المستوى 3 · محطة القطار',
        scene:
          'محطة قطار مزدحمة. المسافرون يمرون في كل اتجاه، لكن المنصات منظّمة والطريق واضح.',
        mission:
          'الهرّة تخطو بثقة أمامك. تقدّم نحو منصتك دون توقّف، عينك على نقطة ثابتة في النهاية.',
        image:
          'https://images.pexels.com/photos/21031431/pexels-photo-21031431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'محطة قطار مزدحمة بالمسافرين',
        encouragement: 'كثافة منظّمة وأنت تعبرها. تتقدّم.',
      },
      {
        index: 3,
        title: 'المستوى 4 · مترو الأنفاق',
        scene:
          'عربة مترو أنفاق مزدحمة بركّاب. الأجساد قريبة، لكن الجميع في طريقهم، لا يلتفتون إليك.',
        mission:
          'الهرّة محتمية بجانبك. ركّز على نقطة ثابتة في العربة وتنفّس ببطء ثلاث مرات.',
        image:
          'https://images.pexels.com/photos/36978293/pexels-photo-36978293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'عربة مترو أنفاق مزدحمة بالركّاب',
        encouragement: 'قرب كثيف وأنت ثابت. صمودك يكبر.',
      },
      {
        index: 4,
        title: 'المستوى 5 · الحفل',
        scene:
          'أنت وسط حفل موسيقي. الأضواء تمسح الجمهور، الموسيقى تحمل الأجساد بلا عنف.',
        mission:
          'تخيّل الهرّة على كتفيك تستمتع بالعرض. تحرّك ببطء مع الجمهور وأنت تتبع الإيقاع.',
        image:
          'https://images.pexels.com/photos/13230484/pexels-photo-13230484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'جمهور حفل موسيقي تحت أضواء ملوّنة',
        encouragement: 'الجمهور ينبض وأكبّت معه دون أن تضيع. نصف الطريق الآن.',
      },
      {
        index: 5,
        title: 'المستوى 6 · الشارع التجاري',
        scene:
          'شارع تجاري كثيف بالمارة يتقاطعون في كل اتجاه. الشمس تتسلل بين المباني.',
        mission:
          'الهرّة تمشي بإيقاعك. تابع طريقك دون انحراف، عينك على نقطة ثابتة في نهاية الشارع.',
        image:
          'https://images.pexels.com/photos/11541295/pexels-photo-11541295.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'شارع تجاري مزدحم بمارة وترام',
        encouragement: 'كثيف، نعم. لكنك تتقدّم، خطوة بعد خطوة.',
      },
      {
        index: 6,
        title: 'المستوى 7 · مهرجان خارجي',
        scene:
          'مهرجان موسيقي في الهواء الطلق. جمهور ضخم ممتد على مساحة واسعة، الجو مفتوح فوقه.',
        mission:
          'الهرّة تحلّق في خيالك فوق الجموع. تنفّس بعمق ودع الموجة تمر حولك.',
        image:
          'https://images.pexels.com/photos/2342413/pexels-photo-2342413.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'جمهور مهرجان موسيقي كبير في الهواء الطلق',
        encouragement: 'السماء مفتوحة فوقك وأنت وسط الكثافة. تتقدّم.',
      },
      {
        index: 7,
        title: 'المستوى 8 · ملعب كرة القدم',
        scene:
          'ملعب ممتلئ بآلاف المشجعين يهتفون. الصوت مدوّ، لكنه فرح جماعي لا تهديد.',
        mission:
          'الهرّة تتعرّف على الأهازيج معك. اترك نفسك للإيقاع الجماعي لدقيقة كاملة.',
        image:
          'https://images.pexels.com/photos/303353/pexels-photo-303353.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'ملعب كرة قدم ممتلئ بمشجعين متحمّسين',
        encouragement: 'آلاف البشر وأكبّت معهم. أنت جزء منهم.',
      },
      {
        index: 8,
        title: 'المستوى 9 · مسيرة كبرى',
        scene:
          'مسيرة كبرى تملأ شارعًا واسعًا. آلاف الأشخاص يعبرون معًا في تسلسل هادئ ومنظّم.',
        mission:
          'الهرّة محمولة على موجة البشر مطمئنة. تنفّس بعمق ودع الموجة تحملك دون مقاومة.',
        image:
          'https://images.pexels.com/photos/32866060/pexels-photo-32866060.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'مسيرة خارجية كبرى بأعلام ملوّنة',
        encouragement: 'وسط زحام هائل وأنت ثابت. شجاعتك مذهلة.',
      },
      {
        index: 9,
        title: 'المستوى 10 · جموع غ figuresة',
        scene:
          'جموع هائلة تملأ ساحة واسعة، مرئية من الأعلى. مئات الألوف، مسالمون، تحت سماء مفتوحة.',
        mission:
          'الهرّة محاطة بملايين البشر ساكنة. تنفّس بعمق واقرأ بقلبك: "أنا بأمان وسط ما كنت أخافه."',
        image:
          'https://images.pexels.com/photos/35266864/pexels-photo-35266864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        alt: 'منظر جوّي لجموع ضخمة في ساحة خضراء',
        encouragement: 'الزحام هائل وأنت واقف هادئ. أكملت كل المستويات.',
      },
    ],
  },
];

export const LIKES: { id: LikeId; label: string; emoji: string }[] = [
  { id: 'cats', label: 'القطط', emoji: '🐱' },
  { id: 'dogs', label: 'الكلاب', emoji: '🐶' },
  { id: 'nature', label: 'الطبيعة', emoji: '🌿' },
  { id: 'sport', label: 'الرياضة', emoji: '⚽' },
  { id: 'music', label: 'الموسيقى', emoji: '🎵' },
];

export function getPhobia(id: PhobiaId): Phobia {
  const p = PHOBIAS.find((x) => x.id === id);
  if (!p) throw new Error(`Phobia not found: ${id}`);
  return p;
}
