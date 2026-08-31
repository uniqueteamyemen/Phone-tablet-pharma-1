import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Share2, 
  Phone, 
  Search, 
  Activity, 
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  Pill,
  HeartHandshake,
  Users,
  Repeat,
  Zap,
  Globe2,
  XCircle,
  Truck,
  FileText,
  BadgeAlert,
  Award,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { PharmaLogo } from './PharmaLogo';
import { INITIAL_DELIVERY_PARTNERS } from '../utils/pharmaStorage';

interface FAQItem {
  q: string;
  a: string;
  tag: 'workflow' | 'matching' | 'social' | 'privacy' | 'responsibility';
}

const FAQS: FAQItem[] = [
  {
    tag: 'responsibility',
    q: 'ما هو دور المنصة القانوني والمهني بدقة؟ وما الذي لا تفعله المنصة؟',
    a: 'المنصة هي شبكة إشارات وتواصل رقمي ذكية فقط تربط بين العارض والطالب (صيدليات، مستشفيات، مستودعات، كوادر طبية، مواطنين). المنصة: (1) لا تبيع ولا تشتري الأدوية، (2) لا تحتفظ بأموال أو تحصّل أي عمولات نقدية، (3) لا تقوم بفحص الأدوية أو ضمان صلاحيتها أو ظروف حفظها وسلسلة التبريد، (4) لا تقدم استشارات طبية أو بديلاً عن الوصفة الطبية الرسمية. المسؤولية المهنية والقانونية وفحص الفواتير والصلاحية تقع بالكامل وبشكل مباشر على الأطراف المتعاملة وفق القوانين واللوائح الصحية اليمنية.',
  },
  {
    tag: 'workflow',
    q: 'هل يمكن تسجيل أدوية غير مسجلة أو أدوات قياس سكر ومستحضرات تجميل وأجهزة؟',
    a: 'نعم بالتأكيد! توفر المنصة خيار "إدخال حر وتجاري مع إرفاق صورة" يتيح لك تسجيل أي دواء نوادر، أدوية الأورام، لاصقات وأجهزة قياس السكر (مثل FreeStyle Libre)، أجهزة التنفس والضغط، مستلزمات العناية والبشرة ومستحضرات الدايت والمكملات الغذائية سواء رغبت بعرضها أو البحث عنها.',
  },
  {
    tag: 'workflow',
    q: 'لماذا خانة السعر اختيارية وغير إلزامية؟',
    a: 'لأن الهدف الأساسي للمنصة هو إبراز توفر الصنف وحل أزمة انقطاعه (Signal matching)، وليس المضاربة بالأسعار أو البيع المباشر. يفضل ترك الاتفاق المالي النهائي بين الصيدليات والموردين وفق لوائح التسعير الرسمية وظروف كل صفقة.',
  },
  {
    tag: 'workflow',
    q: 'ما هو الفرق بين عرض الفائض (Supply) وطلب الاحتياج (Demand)؟',
    a: 'عرض الفائض يُسجله أي طرف (صيدلية، مستشفى، مستودع، عيادة) لديه مخزون زائد أو راكد يخشى انتهاء صلاحيته ويرغب في تصريفه. بينما طلب الاحتياج يُسجله من يعاني من عجز أو شح في صنف دوائي لمرضاه. المنصة تطابق الطرفين آلياً في ثوانٍ.',
  },
  {
    tag: 'responsibility',
    q: 'كيف يتم شحن الأدوية بين المحافظات (صنعاء، عدن، تعز، حضرموت...)؟',
    a: 'توفر المنصة روابط وإشارات ترويجية لشركات وسعاة الشحن الدوائي والسريع المعتمدين في اليمن لتسهيل التنسيق بين الأطراف، دون أن تكون المنصة طرفاً في عقد النقل أو مسؤولة عن الشحنات أو تكاليفها.',
  },
  {
    tag: 'matching',
    q: 'ماذا يحدث إذا كتبت اسم الدواء بالخطأ أو بمسافات ونقاط إضافية؟',
    a: 'محرك البحث الدوائي الذكي مُجهز بنظام التسامح الإملائي الفوري (Typo & Punctuation Tolerance). بمجرد كتابة أول حروف مثل "اوجم" أو "augmentin." أو إدخال مسافات وفواصل، تظهر قائمة منسدلة فورية تحتوي على Augmentin وجميع بدائله المحلية والمستوردة والمادة الفعالة المعيارية.',
  },
  {
    tag: 'privacy',
    q: 'كيف تظهر نتائج المطابقة ومن الذي يستلم أرقام وبيانات التواصل؟',
    a: 'حفاظاً على خصوصية الصيدليات ومنع الإزعاج، لا يتم كشف أرقام الهواتف أو فتح التنسيق المباشر إلا بعد أن يضغط الطرف المعني على زر "أنا مهتم بهذه المطابقة". عندها فقط يُفتح زر واتساب مباشر وزر الاتصال الهاتفي ببيانات مرجعية مشفرة.',
  },
  {
    tag: 'social',
    q: 'ماذا يحدث للرابط التسويقي المنشور على فيسبوك وتليجرام بعد تلبية الدواء؟',
    a: 'تتميز المنصة بنظام الروابط الديناميكية الذكية: بمجرد تأكيد تلبية العرض أو الطلب داخل المنصة، يتحول الرابط تلقائياً إلى بطاقة نجاح تفاعلية نصها: "🎉 تم تلبية هذا الاحتياج بنجاح عبر المنصة! هل لديك عروض أو طلبات أخرى تود إضافتها أو البحث عنها؟"، مما يحول الزوار الجدد إلى مستخدمين فاعلين.',
  },
  {
    tag: 'responsibility',
    q: 'ما هو التعهد المطلوب من الصيدلية أو المستخدم عند تسجيل طلب أو عرض؟',
    a: 'يتعهد المستخدم بصحة البيانات المنشورة، وبالدخول للمنصة لحذف الطلب أو العرض فور تلبيته أو إلغائه لمنع إرباك الزملاء في السوق الدوائي وضمان دقة الخريطة الدوائية لحظياً.',
  },
];

export const PharmaAboutView: React.FC = () => {
  // Active Persona Simulation Tab
  const [activePersona, setActivePersona] = useState<'pharmacy_surplus' | 'pharmacy_shortage' | 'distributor' | 'patient'>('pharmacy_surplus');
  
  // Interactive Step Tracker
  const [activeStep, setActiveStep] = useState<number>(1);

  // Social Link Simulation Status
  const [socialLinkStatus, setSocialLinkStatus] = useState<'active' | 'fulfilled'>('active');

  // FAQ State
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [activeFaqFilter, setActiveFaqFilter] = useState<'all' | 'workflow' | 'matching' | 'social' | 'privacy'>('all');

  const filteredFaqs = FAQS.filter((item) => {
    const matchesFilter = activeFaqFilter === 'all' || item.tag === activeFaqFilter;
    const matchesQuery = item.q.toLowerCase().includes(faqSearch.toLowerCase()) || item.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-950 text-slate-100 max-w-5xl mx-auto">
      
      {/* 1. Header Hero with Clinical Sky & Emerald Gradient */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950/80 to-teal-950/90 border border-sky-500/20 shadow-2xl space-y-4">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PharmaLogo variant="full" size="lg" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              منظومة سوق الدواء الوطني في اليمن
            </span>
          </div>
        </div>

        <p className="relative z-10 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl pt-2 border-t border-slate-800/80">
          تعتبر <strong>PharmaYemen</strong> أول بنية تحتية رقمية ذكية تربط الصيدليات والمستشفيات والمستودعات في جميع محافظات الجمهورية اليمنية. تم تصميمها لحل مشكلتي <strong>«ركود الفائض وتلف الأدوية»</strong> و<strong>«شح الأصناف الحيوية ونقصها»</strong> عبر محرك مطابقة سريرية لحظي، وشبكة نشر تلقائي على منصات السوشيال ميديا.
        </p>

        {/* Quick Value Metrics */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">743+ صنف</div>
              <div className="text-[10px] text-slate-400">كتالوج NEML الوطني</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">مطابقة فورية</div>
              <div className="text-[10px] text-slate-400">تسامح إملائي ذكي</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">بث تليجرام/فيسبوك</div>
              <div className="text-[10px] text-slate-400">روابط ديناميكية ذكية</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">حماية الخصوصية</div>
              <div className="text-[10px] text-slate-400">تنسيق مباشر ومحمي</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Persona Simulation: "ماذا تريد عند دخولك للمنصة؟" */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>دليل المستخدم التفاعلي: ماذا تقدم لك المنصة حسب صفتك؟</span>
            </h3>
            <p className="text-xs text-slate-400">
              اختر نوع حسابك لتتعرف على رحلة الاستخدام المصممة خصيصاً لك سواء دخلت متعمداً أو عبر روابط السوشيال
            </p>
          </div>
        </div>

        {/* Persona Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActivePersona('pharmacy_surplus')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 border cursor-pointer ${
              activePersona === 'pharmacy_surplus'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Pill className="w-4 h-4" />
            </div>
            <span>صيدلية (لدي فائض/راكد)</span>
          </button>

          <button
            onClick={() => setActivePersona('pharmacy_shortage')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 border cursor-pointer ${
              activePersona === 'pharmacy_shortage'
                ? 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Search className="w-4 h-4" />
            </div>
            <span>صيدلية (أبحث عن دواء ناقص)</span>
          </button>

          <button
            onClick={() => setActivePersona('distributor')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 border cursor-pointer ${
              activePersona === 'distributor'
                ? 'bg-teal-950/80 border-teal-500 text-teal-300 shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Building2 className="w-4 h-4" />
            </div>
            <span>مورد أو مستودع جملة</span>
          </button>

          <button
            onClick={() => setActivePersona('patient')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 border cursor-pointer ${
              activePersona === 'patient'
                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span>مريض / زائر سوشيال ميديا</span>
          </button>
        </div>

        {/* Persona Details Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          {activePersona === 'pharmacy_surplus' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>السيناريو: لديك أدوية مكدسة أو أوشكت على الانتهاء وتريد تدويرها قبل الخسارة</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">1. تسجيل العرض بثوانٍ:</strong>
                  <span>اكتب اسم الدواء (اوجم، كيرام، بنادول...) وسيظهر الاسم العلمي والتجاري والتركيز فوراً.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">2. مطابقة آلية مع طالبي الدواء:</strong>
                  <span>محرك الذكاء الدوائي يربط عرضك مع أي صيدلية في محافظتك طلبت نفس الدواء أو بديله السريري.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">3. نشر تلقائي لمجاميع السوشيال:</strong>
                  <span>ضغطة زر تنشئ منشور فيسبوك وتليجرام وبطاقة إنستغرام ستوري لتصل لكل صيادلة مدينتك.</span>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'pharmacy_shortage' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>السيناريو: مريض يحمل وصفة لدواء مقطوع من الوكلاء وتحتاج لتوفيره فوراً</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">1. بحث وتحديد الدواء المطلوب:</strong>
                  <span>سجل طلب احتياج سريع، مع تحديد درجة الاستعجال والكمية المطلوبة.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">2. تنبيه الصيدليات المجاورة:</strong>
                  <span>يصل إشعار فوري في صندوق المطابقات للصيدليات التي لديها مخزون فائض من هذا الصنف.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">3. كشف البدائل المكافئة سريرياً:</strong>
                  <span>إذا لم يتوفر الاسم التجاري المحدد، يقترح النظام البدائل المتطابقة في المادة الفعالة والشكل الصيدلاني.</span>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'distributor' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>السيناريو: مستودع أدوية أو مورد يرغب في مسح احتياجات السوق وتصريف كميات الجملة</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">1. رصد إشارات الطلب الحقيقي:</strong>
                  <span>متابعة ما تبحث عنه صيدليات المحافظات في الوقت الفعلي وتوجيه التوريد نحو الأدوية الأكثر طلباً.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">2. تغذية الصيدليات بالجملة:</strong>
                  <span>تلبية طلبات الاحتياج الكبيرة المجمعة وفتح قنوات توريد معتمدة مباشرة.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">3. تجنب إغراق السوق:</strong>
                  <span>معرفة الأصناف التي تشهد فائضاً تجنباً لاستيراد كميات راكدة إضافية.</span>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'patient' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>السيناريو: قادم من منشور فيسبوك أو تليجرام وتبحث عن دواء نادر لأحد أقاربك</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">1. الدخول عبر الرابط المباشر:</strong>
                  <span>الرابط يأخذك فوراً لصفحة تفاصيل الدواء المطلوب في مدينتك.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">2. حالة الدواء في الوقت الفعلي:</strong>
                  <span>إذا كان الدواء ما زال متاحاً يمكنك الضغط لطلب التنسيق، وإذا تمت تلبيته تظهر بدائل مقترحة فوراً.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <strong className="text-white block">3. تسجيل طلب دوائي جديد:</strong>
                  <span>يمكنك نشر طلب احتياج لأي دواء مفقود ليصل لشبكة الصيادلة فوراً.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Social Media Dynamic Link Lifecycle Section (نظام الروابط التسويقية الذكية) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-500/20 text-teal-400">
                <Repeat className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                دورة حياة الروابط التسويقية وروابط السوشيال الذكية
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              كيف يتصرف الرابط المنشور على فيسبوك وتليجرام قبل وبعد تلبية الدواء؟
            </p>
          </div>

          {/* Interactive State Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSocialLinkStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                socialLinkStatus === 'active'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الحالة 1: الرابط نشط (قيد البحث)</span>
            </button>

            <button
              onClick={() => setSocialLinkStatus('fulfilled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                socialLinkStatus === 'fulfilled'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>الحالة 2: تم تلبية الدواء</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          
          {/* Left: What the external social visitor sees */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Globe2 className="w-3.5 h-3.5" />
                معاينة ما يراه الزائر عند فتح الرابط:
              </span>
              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                https://pharmayemen.app/d/aug-123
              </span>
            </div>

            {socialLinkStatus === 'active' ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-sky-950/50 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    🟢 مطلوب بصورة عاجلة
                  </span>
                  <span className="text-[11px] text-slate-400">صنعاء • شارع حدة</span>
                </div>

                <div>
                  <h4 className="font-black text-sm sm:text-base text-white">Augmentin 1g (أوجمنتين 1 جم)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Amoxicillin + Clavulanic acid • كمية مطلوبة: 20 باكت</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متوفر لدي / تلبية هذا الطلب</span>
                  </button>
                  <button className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1">
                    <span>عرض البدائل</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/50 border border-emerald-500/30 space-y-3 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    تمت التلبية بنجاح
                  </span>
                  <span className="text-[11px] text-emerald-400">اكتمل التنسيق عبر المنصة</span>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                  🎉 <strong>تم تلبية هذا العرض/الطلب بنجاح!</strong>
                  <p className="text-[11px] text-slate-300 mt-1">
                    تم ربط الصيدليتين بنجاح وتوفير الصنف (Augmentin 1g). هل تبحث عن صنف آخر أو لديك أدوية فائضة ترغب بتسجيلها؟
                  </p>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Search className="w-3.5 h-3.5" />
                    <span>ابحث عن دواء آخر</span>
                  </button>
                  <button className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                    <Pill className="w-3.5 h-3.5" />
                    <span>سجل فائض صيدليتك</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Explanation of why this is powerful for marketing */}
          <div className="space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>لماذا هذه الميزة حاسمة في التسويق ونمو المنصة؟</span>
            </h4>
            <p className="leading-relaxed">
              عندما تنشر صيدلية طلباً على تليجرام أو فيسبوك، فإن المنشور قد يبقى متداولاً لعدة أيام. بفضل <strong>الروابط الديناميكية</strong>:
            </p>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <span><strong>منع الاتصالات المتأخرة:</strong> لا يتلقى الصيدلي اتصالات مزعجة بعد أن يكون قد اشترى الدواء وانتهى الاحتياج.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>تحويل الزوار لمستخدمين جدد:</strong> أي طبيب أو صيدلي يفتح الرابط بعد تلبيته يجد دعوة فورية لإضافة احتياجاته هو أو البحث في الكتالوج.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                <span><strong>إثبات كفاءة المنصة:</strong> رؤية إشعار "تمت التلبية بنجاح" يبني ثقة هائلة في سرعة المنصة.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 4. Step-by-Step Procedure Guide (طريقة الإجراءات خطوة بخطوة) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>طريقة إجراءات العمل والربط خطوة بخطوة (4 خطوات)</span>
          </h3>
          <p className="text-xs text-slate-400">
            كيف تتم العملية من لحظة إدخال الدواء وحتى إتمام الاستلام والتسليم
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <span className="absolute top-3 left-3 text-2xl font-black text-slate-800">01</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              <Pill className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">تسجيل الدواء الذكي</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              اختر بين عرض فائض أو طلب احتياج. اكتب أول حروف ليقترح النظام الصنف بالاسم العلمي والتجاري والتركيز فوراً.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <span className="absolute top-3 left-3 text-2xl font-black text-slate-800">02</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">المطابقة السريرية</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تقوم الخوارزمية بمطابقة العرض مع الطلب في نفس المحافظة بالاعتماد على المادة الفعالة والشكل الصيدلاني.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <span className="absolute top-3 left-3 text-2xl font-black text-slate-800">03</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">البث التسويقي الموازي</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              توليد منشورات وقوالب تليجرام وإنستغرام ستوري مخصصة بنقرة واحدة لنشر الإعلان في مجموعات الأطباء والصيادلة.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative">
            <span className="absolute top-3 left-3 text-2xl font-black text-slate-800">04</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              <Phone className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">التنسيق المحمي والتنفيذ</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              عند تأكيد الاهتمام، يُفتح التنسيق عبر واتساب أو اتصال هاتفي مباشر لإتمام التسليم الرسمي وفق لوائح وزارة الصحة.
            </p>
          </div>

        </div>
      </div>

      {/* 5. Comprehensive Interactive FAQ Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <span>الأسئلة الشائعة والاستفسارات (FAQ)</span>
            </h3>
            <p className="text-xs text-slate-400">
              إجابات شافية ومباشرة حول الأمان، آلية البحث، والتعامل مع الأدوية
            </p>
          </div>

          {/* FAQ Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="ابحث في الأسئلة..."
              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFaqFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFaqFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الكل ({FAQS.length})
          </button>
          <button
            onClick={() => setActiveFaqFilter('workflow')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFaqFilter === 'workflow' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            إجراءات العمل
          </button>
          <button
            onClick={() => setActiveFaqFilter('matching')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFaqFilter === 'matching' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            المطابقة والبحث
          </button>
          <button
            onClick={() => setActiveFaqFilter('social')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFaqFilter === 'social' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            السوشيال والتسويق
          </button>
          <button
            onClick={() => setActiveFaqFilter('privacy')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFaqFilter === 'privacy' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الخصوصية والأمان
          </button>
        </div>

        {/* Accordion list */}
        <div className="space-y-2">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/40 bg-slate-900/40">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Clarification: What PharmaYemen DOES vs What PharmaYemen DOES NOT DO */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              نطاق عمل المنصة وإخلاء المسؤولية: ما تفعله وما لا تفعله
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            حدود المسؤولية القانونية والمهنية والتنظيمية للمنصة في سوق الدواء اليمني
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* What we DO */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-emerald-500/20 pb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>ما تفعله المنصة (الوظائف والخدمات المعتمدة)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>ربط إشارات العرض والطلب:</strong> مطابقة فورية بين الصيدليات والمستشفيات لتصريف الفوائض وتغطية النواقص.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>دعم الكتالوج الموحد NEML:</strong> اقتراح الأسماء العلمية والتجارية والبدائل الدوائية المكافئة سريرياً.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>إتاحة تسجيل النواقص والأجهزة غير المسجلة:</strong> إدخال حر مع صور للروشتات وأجهزة السكر والأورام.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>بث تسويقي فوري ومحمي:</strong> توليد بطاقات سوشيال ديناميكية تتحدث حال تلبية الدواء.</span>
              </li>
            </ul>
          </div>

          {/* What we DO NOT do */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-rose-500/20 pb-2">
              <XCircle className="w-4 h-4" />
              <span>ما لا تفعله المنصة (إخلاء مسؤولية صريح)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span><strong>لا نبيع ولا نشتري:</strong> المنصة ليست متجراً إلكترونياً أو وسيطاً تجارياً، ولا تتدخل في تسعير أو تفاوض مالي.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span><strong>صفر عمولات مالية:</strong> لا نحتفظ بأموال ولا نتقاضى عمولات على الصفقات بين الصيدليات والموردين.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span><strong>لا نفحص صلاحية أو تخزين الدواء:</strong> فحص الصلاحية وشروط الحفظ وسلسلة التبريد يقع بالكامل على عاتق الأطراف المتعاملة.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span><strong>ليست بديلاً عن الوصفة الطبية:</strong> لا تقدم المنصة تشخيصاً أو استشارات، وصرف الأدوية خاضع للوائح وزارة الصحة.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 7. Logistics & Delivery Partners (قنوات التوصيل بين المحافظات) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <Truck className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                دليل وسعاة النقل الدوائي والشحن بين المحافظات (خدمة ترويجية مساندة)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              روابط ومعلومات الاتصال المباشرة بشركات الشحن والسعاة المعتمدين في اليمن لتسهيل استلام الأصناف من المحافظات الأخرى
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30 w-fit">
            روابط ترويجية وتسهيل دون مسؤولية المنصة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_DELIVERY_PARTNERS.map((partner) => (
            <div 
              key={partner.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{partner.name}</span>
                </div>
                {partner.isVerified && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    معتمد
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {partner.notes}
              </p>

              <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">المناطق:</span>
                {partner.coverageGovernorates.map((gov, i) => (
                  <span key={i} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {gov}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={`https://wa.me/${partner.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>تواصل واتساب ({partner.phone})</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Trust & Quality Reputation System */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Award className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              نظام موثوقية وتقييم المنشآت الطبية (Trust Score & Reputation)
            </h3>
            <p className="text-xs text-slate-400">
              كيف تضمن المنصة مصداقية العروض وجودة الإشارات والبيانات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>سرعة الاستجابة والتحديث</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تحصل الصيدلية على نقاط ثقة أعلى عند تحديث عروضها والتفاعل السريع مع رسائل المطابقة وحذف الطلبات المكتملة فوراً.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>تحقق الهوية والتراخيص</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تمييز الصيدليات والمستشفيات المعتمدة بشارة التوثيق الزرقاء لتعزيز ثقة الزملاء والموردين في التعامل.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm text-amber-400">
              <Activity className="w-4 h-4" />
              <span>تقييم النزاهة والانضباط</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تقييم متبادل بعد إتمام كل عملية تنسيق يعكس دقة وصف الصنف وتاريخ الصلاحية والالتزام بالمواعيد.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
