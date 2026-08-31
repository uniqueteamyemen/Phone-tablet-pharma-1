import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  CheckCircle2,
  Crown
} from 'lucide-react';
import { PharmaEntity, PharmaOffer, PharmaRequest, PharmaMatch } from '../types/pharmayemen';
import { isEntitySubscribed } from '../utils/pharmaStorage';

interface PharmaSupplyDemandChartProps {
  entity: PharmaEntity;
  offers: PharmaOffer[];
  requests: PharmaRequest[];
  matches: PharmaMatch[];
}

export const PharmaSupplyDemandChart: React.FC<PharmaSupplyDemandChartProps> = ({
  entity,
  offers,
  requests,
  matches,
}) => {
  // Admin & Pro subscription mode toggle for preview testing
  const isSubscribedInitial = isEntitySubscribed(entity);
  const [isAdminMode, setIsAdminMode] = useState(true); // Default enabled for admin preview
  const [metricMode, setMetricMode] = useState<'quantity' | 'frequency'>('quantity');

  const hasAccess = isAdminMode || isSubscribedInitial;

  // Aggregate drug supply vs demand statistics
  const chartData = useMemo(() => {
    const drugMap = new Map<string, { name: string; demand: number; supply: number; requestCount: number; offerCount: number }>();

    // Process Requests (Demand)
    requests.forEach((req) => {
      const name = (req.genericName || req.freeTextName || 'صنف غير محدد').trim();
      if (!name) return;
      const current = drugMap.get(name) || { name, demand: 0, supply: 0, requestCount: 0, offerCount: 0 };
      current.demand += req.quantity || 0;
      current.requestCount += 1;
      drugMap.set(name, current);
    });

    // Process Offers (Supply)
    offers.forEach((off) => {
      const name = (off.genericName || off.brandName || off.freeTextName || 'صنف غير محدد').trim();
      if (!name) return;
      const current = drugMap.get(name) || { name, demand: 0, supply: 0, requestCount: 0, offerCount: 0 };
      current.supply += off.quantity || 0;
      current.offerCount += 1;
      drugMap.set(name, current);
    });

    // Convert to sorted array
    const list = Array.from(drugMap.values()).map((item) => {
      const gap = item.supply - item.demand;
      const deficit = item.demand > item.supply ? item.demand - item.supply : 0;
      let status: 'شح حاد' | 'عجز جزئي' | 'متوازن' | 'فائض معروض';
      if (item.demand > 0 && item.supply === 0) status = 'شح حاد';
      else if (item.demand > item.supply) status = 'عجز جزئي';
      else if (item.supply > item.demand) status = 'فائض معروض';
      else status = 'متوازن';

      return {
        ...item,
        gap,
        deficit,
        status,
        shortName: item.name.length > 18 ? item.name.slice(0, 16) + '…' : item.name,
      };
    });

    // Sort by highest market demand/activity
    return list.sort((a, b) => (b.demand + b.supply) - (a.demand + a.supply)).slice(0, 8);
  }, [offers, requests]);

  // Overall Market Supply-Demand Index & Coverage Rate (Covered Requests / Total Requests)
  const totalDemand = useMemo(() => requests.reduce((acc, r) => acc + (r.quantity || 0), 0), [requests]);
  const totalSupply = useMemo(() => offers.reduce((acc, o) => acc + (o.quantity || 0), 0), [offers]);
  
  // Improvement #2: (Covered Requests / Total Requests)
  const coveredRequestsCount = useMemo(() => {
    const matchedReqIds = new Set(matches.map((m) => m.requestId));
    return requests.filter((r) => matchedReqIds.has(r.id) || r.status === 'fulfilled').length;
  }, [requests, matches]);

  const supplyCoverageRate = requests.length > 0
    ? Math.round((coveredRequestsCount / requests.length) * 100)
    : 100;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs text-right space-y-2 backdrop-blur-md min-w-[200px]" dir="rtl">
          <div className="font-bold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span className="truncate max-w-[150px]">{dataItem.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              dataItem.status === 'شح حاد' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : dataItem.status === 'فائض معروض'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {dataItem.status}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-medium">حجم الطلب (الاحتياج):</span>
              <span className="font-bold text-white">{dataItem.demand.toLocaleString()} وحدة ({dataItem.requestCount} طلب)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-medium">المعروض المتاح:</span>
              <span className="font-bold text-white">{dataItem.supply.toLocaleString()} وحدة ({dataItem.offerCount} عرض)</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold">
              <span className="text-slate-400">فجوة الإمداد:</span>
              <span className={dataItem.gap < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {dataItem.gap > 0 ? `+${dataItem.gap.toLocaleString()}` : dataItem.gap.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-4">
      
      {/* Top Header & Admin Access Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>تحليل فجوات سلاسل الإمداد (الطلب مقابل المعروض)</span>
              <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                خدمة مدفوعة (Pro)
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            رصد الفجوة التراكمية بين طلبات الشح الدوائي وعروض الفائض لمساعدة الصيدليات ومسؤولي التوريد في استشراف العجز
          </p>
        </div>

        {/* Admin preview simulator toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              isAdminMode 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="تبديل محاكاة صلاحيات الإدارة / المستخدم العادي لاختبار حجب الميزة"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAdminMode ? 'صلاحية الإدارة (مفعل)' : 'عرض المستخدم المجاني'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Either Full Recharts View or Locked Paid Banner */}
      {hasAccess ? (
        <div className="space-y-4">
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي الطلب بالسوق</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {totalDemand.toLocaleString()} <span className="text-xs font-normal text-slate-400">وحدة</span>
              </div>
              <div className="text-[10px] text-amber-500 mt-0.5 font-medium">{requests.length} طلبات مسجلة</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي المعروض المتاح</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {totalSupply.toLocaleString()} <span className="text-xs font-normal text-slate-400">وحدة</span>
              </div>
              <div className="text-[10px] text-emerald-500 mt-0.5 font-medium">{offers.length} عروض فائض</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">معدل التغطية الفعلي</span>
                <span className="w-2 h-2 rounded-full bg-teal-500" />
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {supplyCoverageRate}%
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5 font-semibold">
                {coveredRequestsCount} طلب مغطى من أصل {requests.length}
              </div>
            </div>
          </div>

          {/* Recharts Bar Container */}
          <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                مقارنة الأصناف الأكثر تداولاً واحتياجاً
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-400">الطلب (Demand)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-400">المعروض (Supply)</span>
                </div>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                لا توجد بيانات كافية لعرض الرسم البياني. قم بتسجيل عروض وطلبات إضافية.
              </div>
            ) : (
              <div className="h-64 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="demand" 
                      name="حجم الطلب" 
                      fill="#f59e0b" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="supply" 
                      name="المعروض المتاح" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Gaps Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {chartData.filter((d) => d.status === 'شح حاد' || d.status === 'عجز جزئي').slice(0, 4).map((item) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">عجز: {item.deficit.toLocaleString()} وحدة</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* Gated Subscription / Pro Lock Screen */
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-black text-white">
              مؤشرات وإحصائيات سلاسل الإمداد المتقدمة
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              هذه الخدمة التحليلية متاحة حصرياً لمنشآت باقة <strong className="text-amber-300">PharmaPro المعتمدة</strong> وإدارة المنصة، لمساعدتك في اتخاذ قرارات الشراء والتسعير بناءً على حجم الاحتياج الحقيقي في السوق اليمني.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-lg mx-auto text-right text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>كشف فجوات التوريد اللحظية</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>التنبؤ بالشح الدوائي الموسمي</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>أولوية التنسيق المباشر</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAdminMode(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>معاينة الميزة كمسؤول / ترقية الاشتراك</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
