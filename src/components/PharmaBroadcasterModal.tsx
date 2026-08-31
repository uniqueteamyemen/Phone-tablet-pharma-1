import React, { useState } from 'react';
import { 
  Share2, 
  Send, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Radio, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { SocialBroadcastPayload } from '../types/pharmayemen';

interface PharmaBroadcasterModalProps {
  payload: SocialBroadcastPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PharmaBroadcasterModal: React.FC<PharmaBroadcasterModalProps> = ({
  payload,
  isOpen,
  onClose,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'telegram' | 'facebook' | 'instagram' | 'whatsapp'>('telegram');
  const [copied, setCopied] = useState(false);
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  if (!isOpen || !payload) return null;

  const currentText = payload.formattedText[selectedChannel];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateWebhook = () => {
    setIsSimulatingDispatch(true);
    setTimeout(() => {
      setIsSimulatingDispatch(false);
      setDispatchedSuccess(true);
      setTimeout(() => setDispatchedSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-right" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>تجهيز إخطار النشر الآلي عبر السوشيال ميديا</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  جاهز للربط
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                إرسال الإعلان لصفحات وقنوات التواصل مع حماية تامة لسرية هوية الصيدلية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          
          {/* Privacy Guarantee Badge */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-white">ضمان سرية الناشر:</p>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                تم صياغة الإعلان برابط مباشر للمنصة دون ذكر اسم الصيدلية أو رقم الهاتف أو بيانات المنشأة للحفاظ على المنافسة العادلة.
              </p>
            </div>
          </div>

          {/* Social Channels Tabs */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">اختر القناة لمعاينة الإخطار أو نسخه:</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('telegram')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 transition border ${
                  selectedChannel === 'telegram'
                    ? 'bg-sky-600/30 text-sky-300 border-sky-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="text-[11px]">تليجرام</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('facebook')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 transition border ${
                  selectedChannel === 'facebook'
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span className="text-[11px]">فيسبوك</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('instagram')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 transition border ${
                  selectedChannel === 'instagram'
                    ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[11px]">إنستغرام</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('whatsapp')}
                className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 transition border ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="text-[11px]">واتساب</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">نص الإعلان الجاهز للنشر المباشر:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ النص'}</span>
              </button>
            </div>
            
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
              {currentText}
            </pre>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>رابط الويب المتصل مبرمج وجاهز للخدمة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateWebhook}
              disabled={isSimulatingDispatch}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSimulatingDispatch ? (
                <span>جاري البث...</span>
              ) : dispatchedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم إرسال إشارة البث</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span>بث فوري (Webhook Test)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
