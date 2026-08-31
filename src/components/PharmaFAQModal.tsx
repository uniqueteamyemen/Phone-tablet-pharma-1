import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Handshake, 
  Search, 
  Network, 
  CheckCircle2, 
  Layers, 
  Lock,
  Building2,
  Sparkles
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'workflow' | 'matching' | 'entities' | 'privacy';
}

const FAQS: FAQItem[] = [
  {
    category: 'workflow',
    question: 'ما هو الفرق بين عرض الفائض (Supply) وطلب الاحتياج (Demand)؟',
    answer: 'عرض الفائض يُسجله أي طرف (صيدلية، مستشفى، عيادة، موزع) لديه كميات زائدة عن حاجته ويرغب في تدويرها أو بيعها قبل انتهاء الصلاحية. بينما طلب الاحتياج يُسجله من يعاني من عجز أو شح في دواء معين. المنصة تقوم آلياً بالمطابقة السريرية بين الطرفين دون وساطة تقليدية.',
  },
  {
    category: 'entities',
    question: 'هل يمكن لنفس المنشأة أن تكون عارضة وطالبة في نفس الوقت؟',
    answer: 'نعم بكل تأكيد! في القطاع الصحي اليمني، الصيدليات والمستشفيات والعيادات وحتى الأفراد قد يكون لديهم فائض في أصناف معينة (مثل المضادات الحيوية)، بينما يعانون من شح في أصناف أخرى (مثل أدوية الطوارئ أو الأنسولين). تتيح لك المنصة التبديل الفوري بين تسجيل العروض والطلبات من حسابك نفسه.',
  },
  {
    category: 'matching',
    question: 'كيف تظهر نتائج المطابقة ومن الذي يستلم بيانات الاتصال؟',
    answer: 'المطابقة تتم بدقة سريرية تلقائية عبر محرك الذكاء الدوائي. تظهر النتيجة لكلا الطرفين أو للطرف الذي طلب المطابقة. وحفاظاً على الخصوصية ومنع الإزعاج التجاري، لا يتم إرسال أرقام وبيانات التواصل إلا بعد أن يضغط العميل على زر "مهتم بالمطابقة" أو "بدء التنسيق".',
  },
  {
    category: 'matching',
    question: 'كيف يتعامل محرك البحث مع الأخطاء الإملائية والمسافات والنقاط؟',
    answer: 'محرك البحث الدوائي الذكي مُصمم بنظام التسامح المرن (Typo & Punctuation Tolerance). بمجرد كتابة أول حروف مثل "اوجم" تظهر قائمة منسدلة فورية تحتوي على Augmentin وجميع بدائله المحلية والمستوردة، ويتجاهل المحرك أي نقاط أو فواصل أو مسافات إضافية تلقائياً.',
  },
  {
    category: 'privacy',
    question: 'ما الذي يميز منصتنا عن المنصات التقليدية (مثل Manus)؟',
    answer: 'تتميز منصتنا بـ 4 ركائز فريدة: (1) التسامح الإملائي الفوري والبحث بالبدائل والمادة الفعالة، (2) حماية الخصوصية عبر مشاركة الأرقام فقط عند الاهتمام المؤكد، (3) محرك المطابقة السريرية للجرعات والأشكال الدوائية البديلة المعتمدة، (4) تصميم فائق السرعة متوافق مع الموبايل وشبكات الإنترنت الضعيفة في اليمن.',
  },
  {
    category: 'workflow',
    question: 'هل الأصناف المسجلة متوافقة مع قائمة الأدوية الأساسية اليمنية (NEML)؟',
    answer: 'نعم، يتضمن الكتالوج المدمج كافة أصناف قائمة الأدوية الأساسية اليمنية NEML المعتمدة من وزارة الصحة، مع إضافة الأسماء التجارية الشائعة والبدائل المصنعة محلياً وعالمياً.',
  },
];

export const PharmaFAQModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = FAQS.filter(
    (f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 max-w-2xl w-full rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">دليل المنصة والأسئلة الشائعة (FAQ)</h3>
              <p className="text-[11px] text-slate-400">إجراءات العمل، المطابقة الذكية، وحماية الخصوصية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الأسئلة والدليل..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* FAQ List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950/80 rounded-xl border border-slate-800/90 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-3.5 text-right flex items-center justify-between gap-3 hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/40 bg-slate-900/30">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info pill */}
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>تضمن المنصة سرية بيانات التواصل وعدم مشاركتها إلا عند إبداء الرغبة التامة في التنسيق.</span>
        </div>

      </div>
    </div>
  );
};
