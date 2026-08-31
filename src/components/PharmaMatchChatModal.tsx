import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Handshake, 
  AlertTriangle, 
  Lock, 
  UserCheck, 
  Clock,
  Sparkles,
  PhoneCall,
  Check
} from 'lucide-react';
import { PharmaEntity, PharmaMatchTicket, MatchChatMessage } from '../types/pharmayemen';

interface PharmaMatchChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: PharmaMatchTicket | null;
  currentEntity: PharmaEntity;
  onUpdateTicket: (updated: PharmaMatchTicket) => void;
}

export const PharmaMatchChatModal: React.FC<PharmaMatchChatModalProps> = ({
  isOpen,
  onClose,
  ticket,
  currentEntity,
  onUpdateTicket,
}) => {
  const [inputText, setInputText] = useState('');
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (!isOpen || !ticket) return null;

  const isOwner = currentEntity.id === ticket.ownerEntityId || currentEntity.name === ticket.ownerName;
  const otherPartyName = isOwner ? ticket.initiatorName : ticket.ownerName;
  const otherPartyPhone = isOwner ? ticket.initiatorPhone : ticket.ownerPhone;

  // Ethical content moderation check for chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const lower = inputText.toLowerCase();
    const banned = ['ممنوع', 'سوق سوداء', 'مهرب', 'شمة', 'قات'];
    const found = banned.find((w) => lower.includes(w));
    if (found) {
      setWarningNotice(`⚠️ تنبيه: تم حظر الرسالة لاحتوائها على لفظ مخالف للمعايير المهنية: "${found}"`);
      return;
    }
    setWarningNotice(null);

    const newMessage: MatchChatMessage = {
      id: `msg-${Date.now()}`,
      senderEntityId: currentEntity.id,
      senderName: currentEntity.name,
      senderRole: isOwner ? 'receiver' : 'sender',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTicket: PharmaMatchTicket = {
      ...ticket,
      messages: [...ticket.messages, newMessage],
      lastActivityAt: new Date().toISOString(),
    };

    onUpdateTicket(updatedTicket);
    setInputText('');
  };

  // Accept and exchange contact information
  const handleAcceptAndExchangeContacts = () => {
    const updatedTicket: PharmaMatchTicket = {
      ...ticket,
      coordinationStatus: 'approved_open',
      phoneExchanged: true,
      messages: [
        ...ticket.messages,
        {
          id: `msg-system-${Date.now()}`,
          senderEntityId: 'system',
          senderName: 'نظام المنصة',
          senderRole: 'admin',
          text: `🤝 تم قبول طلب التنسيق من قبل (${currentEntity.name}). تم فتح قنوات التواصل المباشر بين الطرفين لإنهاء الاستلام والتسليم بنجاح.`,
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      lastActivityAt: new Date().toISOString(),
    };
    onUpdateTicket(updatedTicket);
  };

  // Mark transaction as successfully completed
  const handleCompleteTransaction = () => {
    const updatedTicket: PharmaMatchTicket = {
      ...ticket,
      coordinationStatus: 'completed',
      messages: [
        ...ticket.messages,
        {
          id: `msg-system-complete-${Date.now()}`,
          senderEntityId: 'system',
          senderName: 'نظام المنصة',
          senderRole: 'admin',
          text: '🎉 تم تأكيد اكتمال الصفقة الدوائية وإغلاق التذكرة بنجاح. شكراً لتعاونكم المهني!',
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      lastActivityAt: new Date().toISOString(),
    };
    onUpdateTicket(updatedTicket);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-xl h-[620px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Chat Top Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">{otherPartyName}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                  ticket.coordinationStatus === 'approved_open'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : ticket.coordinationStatus === 'completed'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {ticket.coordinationStatus === 'approved_open' 
                    ? 'مقبول (محادثة نشطة)' 
                    : ticket.coordinationStatus === 'completed' 
                    ? 'مكتمل' 
                    : 'بانتظار قبول الطرف الآخر'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تنسيق صنف: <strong className="text-emerald-400">{ticket.drugName}</strong> ({ticket.quantity} {ticket.unit}) • {ticket.governorate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Action Banner */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-300">
              {ticket.phoneExchanged ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <span>هاتف الطرف الآخر:</span>
                  <a href={`tel:${otherPartyPhone}`} className="underline font-mono text-white" dir="ltr">
                    {otherPartyPhone}
                  </a>
                </span>
              ) : (
                'الأرقام مخفية حتى يتم التوافق وقبول التنسيق لحماية الخصوصية.'
              )}
            </span>
          </div>

          {/* Action buttons depending on role and status */}
          <div className="flex items-center gap-1.5">
            {!ticket.phoneExchanged && isOwner && (
              <button
                onClick={handleAcceptAndExchangeContacts}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>قبول التنسيق ومشاركة الهاتف</span>
              </button>
            )}

            {ticket.coordinationStatus === 'approved_open' && (
              <button
                onClick={handleCompleteTransaction}
                className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تأكيد استلام الصنف وإغلاق</span>
              </button>
            )}
          </div>
        </div>

        {/* Warning notification banner if any */}
        {warningNotice && (
          <div className="p-2 px-4 bg-rose-950/80 border-b border-rose-500/40 text-[11px] text-rose-300 flex items-center justify-between shrink-0">
            <span>{warningNotice}</span>
            <button onClick={() => setWarningNotice(null)} className="text-xs hover:text-white">✕</button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
          {ticket.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-300 font-bold">بدء المحادثة التنسيقية</p>
              <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                اكتب رسالتك للتأكيد على تفاصيل السعر، تاريخ الصلاحية، ومكان التسليم. المحادثة محمية ومخصصة للطرفين فقط.
              </p>
            </div>
          ) : (
            ticket.messages.map((msg) => {
              if (msg.senderRole === 'admin') {
                return (
                  <div key={msg.id} className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 text-center my-2 space-y-0.5">
                    <p className="font-semibold">{msg.text}</p>
                    <span className="text-[9px] text-purple-400 font-mono">{msg.timestamp}</span>
                  </div>
                );
              }

              const isMe = msg.senderEntityId === currentEntity.id || msg.senderName === currentEntity.name;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] text-slate-500 mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`p-3 rounded-2xl max-w-[82%] text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك التنسيقية هنا (مثال: الصنف جاهز للتسليم في صنعاء)..."
            className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إرسال</span>
          </button>
        </form>

      </div>
    </div>
  );
};
