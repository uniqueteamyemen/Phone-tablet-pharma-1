import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Clock, 
  Share2, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck,
  Database,
  CloudLightning
} from 'lucide-react';
import { 
  loadMarketEvents, 
  generateMarketEventsSummaryReport, 
  exportEventsToJSON, 
  exportEventsToCSV 
} from '../utils/pharmaEventEngine';
import { MarketEventsSummaryReport, PharmaMarketEvent } from '../types/pharmaEvents';

interface PharmaEventAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PharmaEventAnalyticsModal: React.FC<PharmaEventAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'time_to_match' | 'unmatched' | 'reposts' | 'live_stream'>('summary');
  const [report, setReport] = useState<MarketEventsSummaryReport>(() => generateMarketEventsSummaryReport());
  const [recentEvents, setRecentEvents] = useState<PharmaMarketEvent[]>(() => loadMarketEvents().slice(-50).reverse());
  const [workerHealth, setWorkerHealth] = useState<'checking' | 'active' | 'offline'>('checking');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Refresh report when modal opens or on demand
  const handleRefresh = () => {
    setReport(generateMarketEventsSummaryReport());
    setRecentEvents(loadMarketEvents().slice(-50).reverse());
  };

  useEffect(() => {
    if (isOpen) {
      handleRefresh();
      // Check Cloudflare Worker health endpoint
      fetch('/api/health')
        .then((res) => {
          if (res.ok) setWorkerHealth('active');
          else setWorkerHealth('offline');
        })
        .catch(() => setWorkerHealth('offline'));
    }
  }, [isOpen]);

  const handleDownloadJSON = () => {
    const jsonStr = exportEventsToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmayemen_events_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csvStr = exportEventsToCSV();
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmayemen_events_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-inner shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  محرك جمع الأحداث وتحليلات السوق الدوائي
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                  Event Collection Engine
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  workerHealth === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <CloudLightning className="w-3 h-3" />
                  <span>{workerHealth === 'active' ? 'Cloudflare Edge Active' : 'Edge Sync Ready'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع دورة حياة الطلبات والعروض، زمن المطابقة، قياس إعادة النشر، وتحليل أسباب تعثر الطلبات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-800 bg-slate-950/70 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'summary'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المؤشرات الشاملة</span>
          </button>

          <button
            onClick={() => setActiveTab('time_to_match')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'time_to_match'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>زمن المطابقة (Time-to-Match)</span>
          </button>

          <button
            onClick={() => setActiveTab('unmatched')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'unmatched'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تحليل الطلبات غير المطابقة</span>
          </button>

          <button
            onClick={() => setActiveTab('reposts')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reposts'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>إحصاءات إعادة النشر</span>
          </button>

          <button
            onClick={() => setActiveTab('live_stream')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'live_stream'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>سجل الأحداث الحي ({report.totalEventsCount})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">إجمالي الأحداث المسجلة</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {report.totalEventsCount}
                  </div>
                  <div className="text-[10px] text-teal-400 mt-1 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Append-Only Store</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">أحداث الطلبات والعروض</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                    {(report.eventsByType.request_created || 0) + (report.eventsByType.offer_created || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {report.eventsByType.request_created || 0} طلب • {report.eventsByType.offer_created || 0} عرض
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">المطابقات المؤكدة</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                    {report.eventsByType.match_confirmed || 0}
                  </div>
                  <div className="text-[10px] text-emerald-300 mt-1">
                    {report.eventsByType.match_proposed || 0} اقتراح مطابقة
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">معدل نجاح إعادة النشر</div>
                  <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
                    {report.repostMetrics.successRatePercentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {report.repostMetrics.successfulReposts} نجاح من {report.repostMetrics.totalAttempts} محاولة
                  </div>
                </div>
              </div>

              {/* Event Distribution Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>توزيع الأحداث بحسب نوع دورة الحياة</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  {Object.entries(report.eventsByType).map(([evType, count]) => (
                    <div key={evType} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-slate-300">{evType}</span>
                      <span className="font-black text-white bg-slate-800 px-2 py-0.5 rounded-md">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Actions Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">تصدير سجل الأحداث والبيانات التحليلية</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تصدير آمن للبيانات التراكمية غير متضمنة أي معلومات شخصية للمرضى
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadJSON}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>تصدير JSON</span>
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>تصدير CSV (إكسل)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIME TO MATCH */}
          {activeTab === 'time_to_match' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white">مؤشر سرعة الاستجابة وزمن المطابقة (Time-to-Match)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    يقيس هذا المؤشر الفارق الزمني الفعلي بالثواني والدقائق بين لحظة تسجيل طلب الاحتياج ولحظة تأكيد المطابقة مع العرض المناسب.
                  </p>
                </div>
              </div>

              {report.timeToMatch.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-bold">لا توجد مطابقات مكتملة كافية بعد لحساب المتوسطات</p>
                  <p className="text-[11px]">سيتم تحديث هذا الجدول فور تأكيد أول صفقة تنسيق بين صيدلية وعارض.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3">اسم الصنف الدوائي</th>
                        <th className="p-3">عدد الصفقات</th>
                        <th className="p-3">أسرع مطابقة</th>
                        <th className="p-3">متوسط زمن الاستجابة</th>
                        <th className="p-3">أطول مدة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-medium">
                      {report.timeToMatch.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition">
                          <td className="p-3 font-bold text-white">{m.drugName}</td>
                          <td className="p-3 text-teal-400 font-black">{m.matchesCount}</td>
                          <td className="p-3 text-emerald-400 font-bold">{m.fastestMatchFormatted}</td>
                          <td className="p-3 text-amber-300 font-bold">{m.averageMatchFormatted}</td>
                          <td className="p-3 text-slate-400">{Math.round(m.maxSeconds / 60)} دقيقة</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UNMATCHED ANALYSIS */}
          {activeTab === 'unmatched' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white">تحليل فجوات السوق وأسباب تعثر المطابقة</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    تصنيف سريري تلقائي لأسباب إغلاق أو انتهاء صلاحية الطلبات دون مطابقة (نقص المادة الفعالة، اختلاف الجرعة، اختلاف الشكل، أو البعد الجغرافي).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h5 className="font-bold text-white text-xs">توزيع الأسباب الجذرية لعدم المطابقة:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                      <span className="text-rose-300">انعدام تام للمادة الفعالة بالسوق</span>
                      <span className="font-black text-white">{report.unmatchedAnalysis.reasonsBreakdown.no_supply_signal_in_market}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                      <span className="text-amber-300">توفر المادة بتركيز بديل فقط (Strength Gap)</span>
                      <span className="font-black text-white">{report.unmatchedAnalysis.reasonsBreakdown.strength_mismatch_only}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                      <span className="text-sky-300">اختلاف الشكل الصيدلاني (Form Mismatch)</span>
                      <span className="font-black text-white">{report.unmatchedAnalysis.reasonsBreakdown.dosage_form_mismatch_only}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                      <span className="text-purple-300">فجوة جغرافية وتعذر الشحن (Geographic Gap)</span>
                      <span className="font-black text-white">{report.unmatchedAnalysis.reasonsBreakdown.geographic_gap}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                      <span className="text-slate-400">انتهاء المهلة الآلية (7 أيام)</span>
                      <span className="font-black text-white">{report.unmatchedAnalysis.reasonsBreakdown.expired_after_7_days}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h5 className="font-bold text-white text-xs">أعلى الأصناف شحاً وتعثراً:</h5>
                  {report.unmatchedAnalysis.topUnmatchedDrugs.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">لا توجد طلبات مغلقة دون مطابقة حالياً.</div>
                  ) : (
                    <div className="space-y-2">
                      {report.unmatchedAnalysis.topUnmatchedDrugs.map((d, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-900 flex items-center justify-between">
                          <span className="font-bold text-white">{d.drugName}</span>
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-bold">
                            {d.count} حالات شح
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REPOSTS */}
          {activeTab === 'reposts' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Share2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white">إحصاءات إعادة النشر وتوزيع المنصات</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    فصل صارم بين محاولة إعادة النشر ونجاحها الفعلي، مع منع التكرار والتحقق من القنوات.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">إجمالي محاولات النشر</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {report.repostMetrics.totalAttempts}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">العمليات الناجحة المؤكدة</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {report.repostMetrics.successfulReposts}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">نسبة النجاح الإجمالية</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">
                    {report.repostMetrics.successRatePercentage}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-white text-xs">توزيع النشر حسب القنوات والمنصات:</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(report.repostMetrics.platformDistribution).map(([p, c]) => (
                    <div key={p} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-slate-300 capitalize">{p}</span>
                      <span className="font-black text-teal-400">{c}</span>
                    </div>
                  ))}
                  {Object.keys(report.repostMetrics.platformDistribution).length === 0 && (
                    <div className="col-span-full p-4 text-center text-slate-500">
                      لم يتم تسجيل عمليات نشر حتى الآن (وفق إعدادات المنصة).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE STREAM */}
          {activeTab === 'live_stream' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white text-xs">آخر 50 حدثاً مسجلاً في السجل (Append-Only Event Stream):</h5>
                <span className="text-[10px] text-slate-400 font-mono">
                  UTC Time-Stamped • Idempotency Protected
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {recentEvents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                    السجل فارغ حالياً.
                  </div>
                ) : (
                  recentEvents.map((ev) => (
                    <div
                      key={ev.eventId}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            ev.eventType.includes('created')
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ev.eventType.includes('match')
                              ? 'bg-teal-500/20 text-teal-300'
                              : ev.eventType.includes('repost')
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {ev.eventType}
                          </span>
                          <span className="font-bold text-white text-xs">
                            {ev.metadata?.drugNameRaw || ev.entityId}
                          </span>
                          {ev.metadata?.quantity && (
                            <span className="text-[10px] text-slate-400">
                              ({ev.metadata.quantity} {ev.metadata.unit || ''})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                          <span>المعرف: {ev.eventId}</span>
                          <span>•</span>
                          <span>الجهة: {ev.actorType}</span>
                          {ev.metadata?.timeToMatchSeconds && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">
                                زمن المطابقة: {ev.metadata.timeToMatchSeconds}s
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono sm:text-left shrink-0">
                        {new Date(ev.occurredAt).toLocaleString('ar-YE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
