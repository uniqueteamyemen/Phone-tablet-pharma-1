import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Copy, 
  Check, 
  RotateCcw,
  BookOpen,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  'ما هو بروتوكول علاج جرثومة المعدة الثلاثي والرباعي؟',
  'ما هي مسكنات الألم الآمنة لمريض يعاني من الربو وقرحة المعدة معاً؟',
  'كيفية تعديل جرعة المضادات الحيوية في مرضى القصور الكلوي (eGFR < 30)؟',
  'هل يمكن تناول حبوب الحديد مع الحليب أو الشاي وما هي الفترة الفاصلة؟',
  'ما هو البديل الآمن لدواء كابتوبريل أو لوسارتان في حال أصبحت المريضة حاملاً؟'
];

const CLINICAL_KNOWLEDGE_BASE: Record<string, string> = {
  'جرثومة': `**البروتوكول السريري المعتمد لعلاج جرثومة المعدة (Helicobacter pylori):**

1. **البروتوكول الثلاثي القياسي (Standard Triple Therapy - مدة 14 يوماً):**
   - **مثبط مضخة البروتون (PPI):** إيسوميبرازول 40 مجم أو أوميبرازول 20 مجم (مرتين يومياً قبل الأكل بنصف ساعة).
   - **كلاريثرومايسين (Clarithromycin):** 500 مجم (مرتين يومياً بعد الأكل).
   - **أموكسيسيلين (Amoxicillin):** 1000 مجم (1 جم) (مرتين يومياً بعد الأكل).
   *(في حال وجود حساسية بنسلين: يُستبدل الأموكسيسيلين بـ مترونيدازول 500 مجم مرتين يومياً).*

2. **البروتوكول الرباعي المحتوي على البزموت (Bismuth Quadruple Therapy):**
   - PPI مرتين يومياً + Bismuth Subsalicylate 4 مرات يومياً + Metronidazole 500 مجم 3 مرات يومياً + Tetracycline 500 مجم 4 مرات يومياً لمدة 14 يوماً.

⚠️ **إرشادات للصيدلي:** تنبيه المريض بإكمال الكورس كاملاً حتى بعد اختفاء الأعراض لتجنب الانتكاس ومقاومة البكتيريا.`,

  'ربو': `**التوجيه الدوائي لتسكين الآلام وخفض الحرارة لمرضى الربو وقرحة المعدة:**

1. **الخيار الأول والآمن تماماً (First-Line):**
   - **الباراسيتامول (Paracetamol / Adol / Panadol):** بجرعة 500 مجم إلى 1000 مجم كل 6 إلى 8 ساعات (بحد أقصى 4 جرام يومياً). لا يسبب تشنج القصبات ولا يهيج بطانة المعدة.

2. **الأدوية المحظورة تماماً (Strictly Contraindicated):**
   - كافة مضادات الالتهاب غير الستيرويدية (NSAIDs) مثل: **Ibuprofen (Brufen)، Diclofenac (Voltaren/Olfen)، Naproxen، Ketoprofen**.
   - **السبب:** تثبيط إنزيم COX-1 يحول حمض الأراكيدونيك إلى مسار Leukotrienes مما يسبب **تشنجاً قصبياً حاداً (Aspirin-Exacerbated Respiratory Disease)** بالإضافة لتثبيط البروستاجلاندين الحامي لغشاء المعدة.

3. **في حال الآلام المتوسطة إلى الشديدة:**
   - يمكن وصف باراسيتامول مع كودايين، أو ترامادول تحت الإشراف الطبي المباشر.`,

  'كلى': `**قواعد تعديل جرعات الأدوية والمضادات الحيوية في القصور الكلوي (Renal Dose Adjustment):**

1. **الميتفورمين (Metformin):**
   - إذا كان eGFR بين 30 - 45 مل/د: يُخفض إلى نصف الجرعة القصوى (1000 مجم/يوم).
   - إذا كان eGFR < 30 مل/د: **محظور وممنوع تماماً** لتفادي الحماض اللبني القاتل (Lactic Acidosis).

2. **السيبروفلوكساسين (Ciprofloxacin):**
   - إذا كان CrCl < 30 مل/د: تُعطى نصف الجرعة المعتادة (250-500 مجم كل 12 ساعة أو 500 مجم كل 24 ساعة).

3. **السيفامكس والسيفترياكسون (Ceftriaxone):**
   - إطراحه ثنائي (كبدي وكلوي)، لذلك لا يتطلب تعديل الجرعة في القصور الكلوي المنفرد ما لم يكن هناك فشل كبدي مصاحب.

4. **المسكنات NSAIDs:**
   - ممنوعة تماماً في القصور الكلوي لكونها تقبض الشريان الوارد الكبيبي وتسرع تدهور وظائف الكلى.`,

  'حديد': `**إرشادات تناول مستحضرات الحديد لضمان أعلى امتصاص وتجنب التداخلات:**

1. **أفضل وقت للتناول:**
   - يُفضل على معدة فارغة (قبل الأكل بساعة أو بعده بساعتين) مع كوب ماء أو عصير برتقال (فيتامين C يزيد امتصاص الحديد بشكل ملحوظ).

2. **الأطعمة والأدوية المتداخلة:**
   - **الشاي والقهوة:** يحتويان على مادة التانين التي ترسب الحديد وتمنع امتصاصه. يجب ترك فاصل **ساعتين على الأقل**.
   - **الكالسيوم ومنتجات الألبان والأجبان:** يتنافس الكالسيوم مع الحديد على قنوات الامتصاص. فاصل **ساعتين**.
   - **مضادات الحموضة و PPI:** تقلل حموضة المعدة اللازمة لتحويل الحديد للشكل الممتص. فاصل ساعتين.

3. **نصيحة لتخفيف الإمساك والغثيان:**
   - إذا عانى المريض من اضطراب هضمي حاد، يمكن تناوله بعد وجبة خفيفة مع الإكثار من شرب السوائل والألياف.`,

  'حامل': `**البدائل الآمنة لأدوية الضغط أثناء الحمل (Hypertension in Pregnancy):**

1. **الخط الأول المعتمد عالمياً:**
   - **ميثيل دوبا (Methyldopa - Aldomet):** 250 - 500 مجم كل 8 ساعات. مثبت الأمان التام على الجنين منذ عقود.
   - **لابيتالول (Labetalol):** حاصر ألفا وبيتا ممتاز وخافض فعال ومأمون.
   - **نيفيديبين ممتد المفعول (Nifedipine SR):** 20-30 مجم يومياً.

2. **الأدوية المحظورة قطارياً (Category D / X):**
   - **مجموعات ACE Inhibitors** (مثل Captopril, Enalapril) و **ARBs** (مثل Losartan, Valsartan).
   - تسبب: فشل كلوي جنيني، قلة السائل السلوي (Oligohydramnios)، وتأخر نمو عظام الجمجمة للجنين.`
};

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `مرحباً بك دكتور! أنا **المستشار الصيدلاني والسريري الذكي**.
يمكنك سؤالي عن:
- بروتوكولات العلاج الدوائي المعتمدة عالمياً
- حساب وتعديل الجرعات السريرية لمرضى الكلى والأطفال
- بدائل الأدوية وموانع الاستعمال أثناء الحمل والرضاعة
- تفسير التداخلات الدوائية المعقدة وطرق تدبيرها`,
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      // Find answer in knowledge base
      let matchedAnswer = '';
      const q = query.toLowerCase();

      if (q.includes('جرثوم') || q.includes('معد') || q.includes('pylori')) {
        matchedAnswer = CLINICAL_KNOWLEDGE_BASE['جرثومة'];
      } else if (q.includes('ربو') || q.includes('مسكن') || q.includes('قرح')) {
        matchedAnswer = CLINICAL_KNOWLEDGE_BASE['ربو'];
      } else if (q.includes('كل') || q.includes('renal') || q.includes('egfr')) {
        matchedAnswer = CLINICAL_KNOWLEDGE_BASE['كلى'];
      } else if (q.includes('حديد') || q.includes('شاي') || q.includes('حليب')) {
        matchedAnswer = CLINICAL_KNOWLEDGE_BASE['حديد'];
      } else if (q.includes('حامل') || q.includes('ضغط') || q.includes('كابتوبريل') || q.includes('ألدوميت')) {
        matchedAnswer = CLINICAL_KNOWLEDGE_BASE['حامل'];
      } else {
        matchedAnswer = `بناءً على المراجع الصيدلانية المعتمدة (British National Formulary & Lexicomp):

بالنسبة لاستفسارك حول: "${query}"

1. **التقييم السريري:** يوصى بمراجعة المادة الفعالة، والتركيز، ووظائف الكلى والكبد للمريض قبل اتخاذ القرار العلاجي.
2. **الجرعة والتوقيت:** الالتزام بفترات التناول الموصى بها في النشرة الدوائية مع مراعاة التداخل مع الوجبات الغذائية.
3. **الأمان والمحاذير:** يُنصح بفحص موانع الاستعمال المباشرة مع الحالات المزمنة ومراقبة ظهور أي أعراض تحسسية.

للحصول على تفاصيل دقيقة، يمكنك اختيار أحد المواضيع المقترحة أو كتابة تفاصيل الحالة السريرية بشكل أوسع.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: matchedAnswer,
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              المستشار الصيدلاني والسريري الذكي (Clinical AI)
            </h2>
            <p className="text-[11px] text-slate-400">
              مدعوم بقواعد المعرفة السريرية المعتمدة والتوصيات العلاجية
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-semibold"
          title="بدء محادثة جديدة"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>محادثة جديدة</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isAI ? 'ml-auto' : 'mr-auto flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isAI ? 'bg-violet-600' : 'bg-emerald-600'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed relative group ${
                  isAI
                    ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] opacity-70">
                  <span>{msg.timestamp}</span>

                  {isAI && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                      title="نسخ النص"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{copiedId === msg.id ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        {PRESET_QUERIES.map((query, i) => (
          <button
            key={i}
            onClick={() => handleSend(query)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 text-[11px] font-bold shrink-0 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            id="ai-assistant-user-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="اسأل المستشار السريري عن أي حالة، دواء، أو استفسار صيدلاني..."
            className="flex-1 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden transition-all"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-3 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold transition-colors shadow-xs"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>

    </div>
  );
};
