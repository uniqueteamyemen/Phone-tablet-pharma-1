import React from 'react';
import { ShieldCheck, BookOpen, Layers, CheckCircle2, Globe, HeartHandshake } from 'lucide-react';
import { PharmaLogo } from './PharmaLogo';

export const PharmaAboutView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 max-w-4xl mx-auto">
      
      {/* Hero */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PharmaLogo variant="full" size="lg" />
          <span className="text-[11px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
            منصة ذكاء سوق الدواء الوطني في اليمن
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-700">
          تم تصميم وبناء هذه المنصة لتكون محركاً تنظيمياً وذكياً لإشارات العرض والطلب بين المنشآت الصحية (الصيدليات، المستودعات، والمستشفيات) في جميع محافظات الجمهورية اليمنية، معتمدة على القائمة الوطنية للأدوية الأساسية (NEML) ومحرك مطابقة دوائي فائق التسامح.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">1. الكتالوج الوطني الموحد</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            يضم 743 صنفاً دوائياً أساسياً معيارياً مستخرجاً ومحدثاً من وثائق وزارة الصحة اليمنية، يتيح البحث المرن بالاسم العلمي والتجاري والتراكيز.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">2. محرك المطابقة الذكي</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            خوارزمية Levenshtein & Fuzzy Scoring لاكتشاف التطابق اللحظي بين الفائض في منشأة والاحتياج في منشأة أخرى مع التسامح مع الأخطاء الإملائية.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">3. حوكمة الإشارات والخصوصية</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ليست متجراً إلكترونياً أو وسيط مدفوعات، بل بنية تحتية لتبادل المؤشرات الصحية وتوثيق مسارات التغطية الدوائية الرسمية.
          </p>
        </div>

      </div>

      {/* Portable Architecture & Guidelines */}
      <div className="bg-emerald-50/50 dark:bg-slate-800/60 p-6 rounded-2xl border border-emerald-500/20 space-y-3">
        <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          توافق كامل مع الهاتف والمتصفح والأجهزة اللوحية
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          تعمل هذه النسخة بشكل فوري ومستقل دون الحاجة لأي تهيئة خارجية، وتخزن بيانات العروض والطلبات والمطابقات محلياً مع إمكانية التصدير والعمل عبر الشبكة.
        </p>
      </div>

    </div>
  );
};
