import { DrugInteractionRule } from '../types';

export const INTERACTIONS_DATABASE: DrugInteractionRule[] = [
  {
    drug1Generic: 'Omeprazole',
    drug2Generic: 'Clopidogrel',
    severity: 'severe',
    title: 'تثبيط فعالية مضاد التجلط كلوبيدوجريل',
    description: 'يقوم الأوميبرازول بتثبيط إنزيم CYP2C19 الكبدي المسؤول عن تنشيط كلوبيدوجريل.',
    clinicalEffect: 'انخفاض كبير في التأثير المضاد للصفائح الدموية وزيادة خطر الجلطات والاحتشاء القلبي.',
    recommendation: 'استبدال الأوميبرازول بـ بانتوبرازول (Pantoprazole) أو فاموتيدين (Famotidine) حيث لا يتداخلان مع CYP2C19.'
  },
  {
    drug1Generic: 'Captopril',
    drug2Generic: 'Spironolactone',
    severity: 'severe',
    title: 'خطر ارتفاع بوتاسيوم الدم القاتل (Hyperkalemia)',
    description: 'كلا الدواءين يسببان احتباس البوتاسيوم في الدم عبر تثبيط نظام الرينين-أنجيوتنسين-ألدوستيرون.',
    clinicalEffect: 'عدم انتظام ضربات القلب القاتل، توقف القلب، وضعف عضلي حاد.',
    recommendation: 'المراقبة الصارمة لنسبة البوتاسيوم في مصل الدم ووظائف الكلى وتجنب مكملات البوتاسيوم.'
  },
  {
    drug1Generic: 'Captopril',
    drug2Generic: 'Ibuprofen',
    severity: 'moderate',
    title: 'تراجع فعالية خافض الضغط وسمية كلوية ثلاثية',
    description: 'المسكنات NSAIDs تثبط البروستاجلاندين الكلوي الموسع للشرايين مما يعاكس تأثير مثبطات ACE.',
    clinicalEffect: 'ارتفاع ضغط الدم وتدهور وظائف الكلى وتراجع التصفية الكلوية.',
    recommendation: 'تجنب الاستخدام المزمن لمسكنات NSAIDs؛ استخدام الباراسيتامول كمسكن آمن ومراقبة الضغط والكلى.'
  },
  {
    drug1Generic: 'Ciprofloxacin',
    drug2Generic: 'Theophylline',
    severity: 'severe',
    title: 'تسمم حاد بالثيوفيلين ونوبات صرع',
    description: 'السيبروفلوكساسين يثبط إنزيم CYP1A2 مما يضاعف تركيز الثيوفيلين في الدم بمقدار 2 إلى 3 أضعاف.',
    clinicalEffect: 'غثيان شديد، تسارع خطير في ضربات القلب، نوبات تشنجية وغيبوبة.',
    recommendation: 'تجنب هذا المزيج تماماً أو تقليل جرعة الثيوفيلين بمقدار 50% ومراقبة تركيز الدواء في الدم.'
  },
  {
    drug1Generic: 'Ciprofloxacin',
    drug2Generic: 'Iron + Folic Acid + B12 + Zinc',
    severity: 'moderate',
    title: 'فقدان امتصاص المضاد الحيوي (Cheletion)',
    description: 'يتحد السيبروفلوكساسين مع أيونات الحديد والكالسيوم والمغنيسيوم مكوناً معقدات غير قابلة للامتصاص.',
    clinicalEffect: 'فشل العلاج بالمضاد الحيوي واستمرار العدوى البكتيرية.',
    recommendation: 'يجب تناول السيبروفلوكساسين قبل مكملات الحديد بـ ساعتين أو بعدها بـ 4 ساعات على الأقل.'
  },
  {
    drug1Generic: 'Fluoxetine HCl',
    drug2Generic: 'Tramadol',
    severity: 'severe',
    title: 'خطر متلازمة السيروتونين ونوبات الصرع',
    description: 'كلا الدواءين يرفعان مستويات السيروتونين في الجهاز العصبي المركزي ويثبطان العتبة التشنجية.',
    clinicalEffect: 'ارتفاع حرارة الجسم، صلابة العضلات، هذيان، نوبات صرع حادة وتشنجات.',
    recommendation: 'تجنب الجمع بينهما؛ استخدام مسكنات غير سيروتونينية ومراقبة علامات التسمم السيروتونيني.'
  },
  {
    drug1Generic: 'Digoxin',
    drug2Generic: 'Furosemide',
    severity: 'severe',
    title: 'تسمم الديجوكسين نتيجة نقص بوتاسيوم الدم',
    description: 'مدر البول لازيكس يسبب إفراز البوتاسيوم والمغنيسيوم، ونقص البوتاسيوم يضاعف حساسية القلب لسمية الديجوكسين.',
    clinicalEffect: 'اضطرابات نظم القلب البطينية القاتلة، بطء القلب، قيء واضطراب بصري.',
    recommendation: 'مراقبة مستوى البوتاسيوم بالدم باستمرار وإعطاء مكملات بوتاسيوم أو مدر حافظ للبوتاسيوم.'
  },
  {
    drug1Generic: 'Glimepiride',
    drug2Generic: 'Ibuprofen',
    severity: 'moderate',
    title: 'زيادة خطر هبوط السكر الحاد (Hypoglycemia)',
    description: 'المسكنات NSAIDs قد تزيح السلفونيل يوريا من بروتينات البلازما وتقلل إفرازها الكلوي.',
    clinicalEffect: 'هبوط مفاجئ في سكر الدم، دوخة، تعرق، إغماء وهبوط طاقة.',
    recommendation: 'توعية المريض بأعراض هبوط السكر وفحص سكر الدم بشكل متكرر، وتفضيل الباراسيتامول.'
  },
  {
    drug1Generic: 'Levothyroxine Sodium',
    drug2Generic: 'Iron + Folic Acid + B12 + Zinc',
    severity: 'moderate',
    title: 'تثبيط امتصاص هرمون الغدة الدرقية',
    description: 'الحديد يرتبط بالليفوثيروكسين في المعدة ويشكل مركباً غير قابل للامتصاص.',
    clinicalEffect: 'استمرار أعراض كسل الغدة الدرقية وارتفاع هرمون TSH رغم تناول الجرعة.',
    recommendation: 'الفصل الزمني الصارم لمدة لا تقل عن 4 ساعات بين دواء الغدة الدرقية ومكملات الحديد والكالسيوم.'
  },
  {
    drug1Generic: 'Bisoprolol Fumarate',
    drug2Generic: 'Salbutamol (Albuterol)',
    severity: 'moderate',
    title: 'تعاكس دوائي وتفاقم أزمات الربو',
    description: 'حاصرات بيتا تعاكس التأثير الموسع للقصبات لمستقبلات بيتا 2 وتزيد تضيق الشعب الهوائية.',
    clinicalEffect: 'ضيق تنفس حاد وتراجع استجابة المريض لبخاخ الفينتولين.',
    recommendation: 'الحذر عند مرضى الربو، واستخدام حاصرات قنوات الكالسيوم كبديل لضغط الدم عند مرضى الجهاز التنفسي.'
  },
  {
    drug1Generic: 'Diclofenac Sodium',
    drug2Generic: 'Prednisolone',
    severity: 'severe',
    title: 'تضاعف خطر قرحة ونزيف المعدة والاثني عشر',
    description: 'الجمع بين مضادات الالتهاب غير الستيرويدية والكورتيزونات يضاعف تآكل الغشاء المخاطي للمعدة بمقدار 4 إلى 15 ضعفاً.',
    clinicalEffect: 'نزيف معوي حاد، تقيؤ دموي، ثقب في جدار المعدة، وآلام بطنية حادة.',
    recommendation: 'تجنب الجمع إلا للضرورة القصوى مع وصف واقي معدة إلزامي (مثل أوميبرازول أو إيسوميبرازول).'
  },
  {
    drug1Generic: 'Diclofenac Potassium',
    drug2Generic: 'Ibuprofen',
    severity: 'severe',
    title: 'ازدواجية غير مبررة لمسكنات NSAIDs ومضاعفة السمية',
    description: 'تناول مسكنين من نفس العائلة لا يقدم أي تسكين إضافي للألم.',
    clinicalEffect: 'مضاعفة فورية لمخاطر الفشل الكلوي الحاد وقرح المعدة دون فائدة علاجية.',
    recommendation: 'يمنع وصف أكثر من دواء NSAID فموي معاً؛ استخدم مسكناً مركزياً مثل الباراسيتامول كإضافة.'
  }
];
