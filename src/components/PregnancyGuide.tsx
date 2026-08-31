import React, { useState } from 'react';
import { 
  Baby, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Search, 
  CheckCircle2, 
  AlertOctagon,
  Heart
} from 'lucide-react';

interface ClinicalConditionGuide {
  conditionAr: string;
  safeDrugsAr: string[];
  cautiousDrugsAr: string[];
  contraindicatedDrugsAr: string[];
  notesAr: string;
}

export const PregnancyGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conditions' | 'categories'>('conditions');
  const [searchFilter, setSearchFilter] = useState('');

  const guides: ClinicalConditionGuide[] = [
    {
      conditionAr: 'ارتفاع ضغط الدم أثناء الحمل (Hypertension in Pregnancy & Preeclampsia)',
      safeDrugsAr: ['ميثيل دوبا (Methyldopa - Aldomet)', 'لابيتالول (Labetalol)', 'نيفيديبين ممتد المفعول (Nifedipine SR)'],
      cautiousDrugsAr: ['أملوديبين (Amlodipine - بحذر بعد الثلث الأول)'],
      contraindicatedDrugsAr: ['مثبطات ACE مثل كابتوبريل وإينالابريل (تشوهات كلوية جنينية قاتلة)', 'حاصرات ARBs مثل لوسارتان وفالسارتان', 'مدرات البول الثيازيدية واللازيكس (تقليل تدفق المشيمة)'],
      notesAr: 'علاج الخط الأول هو ألدوميت أو لابيتالول مع مراقبة زلال البول وضغط الدم بانتظام.'
    },
    {
      conditionAr: 'العدوى والمضادات الحيوية (Infections & Antibiotics in Pregnancy)',
      safeDrugsAr: ['البنسلينات (Amoxicillin, Augmentin, Clavox)', 'السيفالوسبورينات (Cefamex, Ceftriaxone, Cefixime, Cephalexin)', 'الماكروليدات (Azithromycin, Erythromycin)'],
      cautiousDrugsAr: ['مترونيدازول فلاجيل (Flagyl - بحذر بعد الثلث الأول)', 'كليندامايسين (Clindamycin)'],
      contraindicatedDrugsAr: ['الفلوروكينولونات مثل سيبروفلوكساسين وليفوفلوكساسين (تلف غضاريف ومفاصل الجنين)', 'التتراسيكلين والدوكسيسيكلين (تصبغ أسنان الجنين وتأخر نمو العظام)', 'الأمينوغليكوزيدات كالجنتامايسين بجرعات عالية (سمية سمعية وكلوية)'],
      notesAr: 'البنسلينات والسيفالوسبورينات من أكثر المضادات الحيوية أماناً وتعتبر الخيار الأول دوماً.'
    },
    {
      conditionAr: 'تسكين الآلام وخفض الحرارة (Pain & Fever Relief)',
      safeDrugsAr: ['الباراسيتامول / أدول / بانادول (Paracetamol - فئة B وآمن في جميع مراحل الحمل)'],
      cautiousDrugsAr: ['المسكنات الموضعية البسيطة'],
      contraindicatedDrugsAr: ['مضادات الالتهاب غير الستيرويدية NSAIDs مثل بروفين، فولتارين، أولفين، ديكلوفيناك (محظورة تماماً في الثلث الأخير لإغلاقها القناة الشريانية الجنينية المبكر)', 'الأسبرين بجرعات علاجية عالية', 'المسكنات الأفيونية مثل الترامادول'],
      notesAr: 'الباراسيتامول هو المسكن والخافض الوحيد الموصى به طوال أشهر الحمل التسعة.'
    },
    {
      conditionAr: 'داء السكري وسكري الحمل (Gestational Diabetes & Glycemia)',
      safeDrugsAr: ['الإنسولين بجميع أنواعه (Lantus, Actrapid, Humalog - لا يعبر المشيمة وآمن 100%)', 'الميتفورمين (Glucophage - فئة B ويستخدم بعد تقييم الطبيب)'],
      cautiousDrugsAr: [],
      contraindicatedDrugsAr: ['السلفونيل يوريا مثل أماريل ودايمكرون (خطر هبوط سكر الجنين الحاد وتضخمه)'],
      notesAr: 'الإنسولين هو المعيار الذهبي المطلق لضبط سكر الحمل لحماية الجنين من التشوهات والعملقة.'
    },
    {
      conditionAr: 'الحموضة وارتجاع المريء (GERD & Heartburn in Pregnancy)',
      safeDrugsAr: ['مضادات الحموضة البسيطة (Mylanta, Rennie, Gaviscon)', 'فاموتيدين / رانيتيدين (Famotidine H2 Blocker)', 'إيسوميبرازول وأوميبرازول (Nexium / Omedar)'],
      cautiousDrugsAr: [],
      contraindicatedDrugsAr: ['بيكربونات الصوديوم الفوارة (احتباس السوائل وارتفاع الضغط)'],
      notesAr: 'يبدأ بالعلاج التغذوي ثم مضادات الحموضة الموضعية ثم حاصرات H2 ثم مثبطات PPI.'
    },
    {
      conditionAr: 'الربو القصبي وأزمات التنفس (Asthma in Pregnancy)',
      safeDrugsAr: ['بخاخ فينتولين سالبوتامول (Ventolin Inhaler - منقذ للحياة)', 'بخاخ بوديزونيد كورتيزون استنشاقي (Symbicort / Pulmicort)'],
      cautiousDrugsAr: ['حبوب الكورتيزون الفموية للحالات الشديدة'],
      contraindicatedDrugsAr: ['حاصرات بيتا غير الانتقائية'],
      notesAr: 'السيطرة على الربو لدى الأم الحامل ضرورية جداً لضمان وصول الأكسجين الكافي لدماغ الجنين.'
    }
  ];

  const filteredGuides = guides.filter((g) =>
    g.conditionAr.includes(searchFilter) ||
    g.safeDrugsAr.some((d) => d.includes(searchFilter)) ||
    g.contraindicatedDrugsAr.some((d) => d.includes(searchFilter))
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                دليل الأمان الدوائي أثناء الحمل والرضاعة الطبيعية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                الخيارات العلاجية الآمنة وقائمة الأدوية المحظورة لحماية صحة الأم والجنين
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border text-xs font-bold">
            <button
              onClick={() => setActiveTab('conditions')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'conditions'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              دليل الحالات المرضية
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              فئات FDA (A-X)
            </button>
          </div>
        </div>

        {/* Tab 1: Clinical Condition Guide */}
        {activeTab === 'conditions' && (
          <div className="space-y-4">
            
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="ابحث بالحالة المرضية (مثل: ضغط، مسكن، سكر، مضاد، ربو)..."
                className="w-full pl-3 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-pink-500"
              />
            </div>

            {/* Guides Cards */}
            <div className="space-y-4">
              {filteredGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    {guide.conditionAr}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Safe Options */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                      <div className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>الأدوية الآمنة والمفضلة (Safe Options):</span>
                      </div>
                      <ul className="space-y-1 pr-2">
                        {guide.safeDrugsAr.map((d, i) => (
                          <li key={i} className="text-emerald-950 dark:text-emerald-200 font-medium">
                            • {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Contraindicated Options */}
                    <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
                      <div className="font-extrabold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                        <span>الأدوية المحظورة والخطيرة (Contraindicated):</span>
                      </div>
                      <ul className="space-y-1 pr-2">
                        {guide.contraindicatedDrugsAr.map((d, i) => (
                          <li key={i} className="text-rose-950 dark:text-rose-200 font-medium">
                            ✕ {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Clinical note */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <span>{guide.notesAr}</span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 2: FDA Categories Reference */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 gap-4">
            
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                  Category A
                </span>
                <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                  آمن تماماً (Safe in Pregnancy)
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-relaxed pr-2">
                دراسات بشرية سريرية محكمة أثبتت عدم وجود أي خطر على الجنين في جميع أشهر الحمل. أمثلة: حمض الفوليك، فيتامين ب6، هرمون الليفوثيروكسين، فيتامين د بالجرعات المعتادة.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
                  Category B
                </span>
                <span className="font-extrabold text-sm text-blue-900 dark:text-blue-200">
                  آمن ويرجح عدم وجود خطر (No Evidence of Risk)
                </span>
              </div>
              <p className="text-xs text-blue-900/80 dark:text-blue-300 leading-relaxed pr-2">
                دراسات الحيوان لم تظهر خطراً، أو أظهرت خطراً لم يُثبت في البشر. أمثلة: باراسيتامول، أموكسيسيلين وكلافولانيك (أوجمنتين)، سيفامكس (سيفترياكسون)، أزيترومايسين، ميتفورمين، إنسولين.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs">
                  Category C
                </span>
                <span className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                  يستخدم عند الضرورة القصوى فقط (Risk Cannot be Ruled Out)
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed pr-2">
                دراسات غير كافية أو أظهرت خطراً في الحيوانات. يُستخدم فقط إذا كانت المنفعة للأم تفوق الخطر المحتمل على الجنين. أمثلة: كبسولات أوميبرازول، فلوكونازول جرعة وحيدة، سيبروفلوكساسين، بريدنيزولون.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-orange-600 text-white font-black text-xs">
                  Category D
                </span>
                <span className="font-extrabold text-sm text-orange-900 dark:text-orange-200">
                  خطر مثبت على الجنين (Positive Evidence of Risk)
                </span>
              </div>
              <p className="text-xs text-orange-900/80 dark:text-orange-300 leading-relaxed pr-2">
                توجد أدلة قطعية على أضرار جنينية بشرية، لكن قد يُستخدم في حالات الطوارئ القصوى المهددة للحياة في حال عدم وجود بدائل. أمثلة: كابتوبريل، مسكنات NSAIDs في الثلث الثالث، لورازيبام، كاربامازيبين.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-xs">
                  Category X
                </span>
                <span className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                  محظور وممنوع تماماً (Contraindicated in Pregnancy)
                </span>
              </div>
              <p className="text-xs text-rose-900/80 dark:text-rose-300 leading-relaxed pr-2">
                يسبب تشوهات جنينية خطيرة مؤكدة، ومخاطره تفوق أي منفعة علاجية متوقعة. يمنع صرفه نهائياً للمرأة الحامل أو التي تخطط للحمل. أمثلة: الستاتينات (Atorvastatin)، ميثوتريكسات، الإيزوتريتينوين (Roaccutane)، والوارفارين.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
