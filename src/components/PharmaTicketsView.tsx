import React, { useState } from 'react';
import { 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  ArrowLeftRight, 
  CheckCircle2, 
  Phone, 
  Building2, 
  Search, 
  Sparkles, 
  Lock, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { PharmaMatchTicket, PharmaEntity, PharmaUserRole } from '../types/pharmayemen';

interface PharmaTicketsViewProps {
  tickets: PharmaMatchTicket[];
  entity: PharmaEntity;
  userRole: PharmaUserRole;
  onOpenChat: (ticket: PharmaMatchTicket) => void;
  onUpdateTicket: (updated: PharmaMatchTicket) => void;
}

export const PharmaTicketsView: React.FC<PharmaTicketsViewProps> = ({
  tickets,
  entity,
  userRole,
  onOpenChat,
  onUpdateTicket,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_approval' | 'approved_open' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Visible tickets based on role and entity ownership
  const visibleTickets = tickets.filter((t) => {
    if (userRole === 'admin') return true;
    const isMine = 
      t.initiatorEntityId === entity.id || 
      t.ownerEntityId === entity.id || 
      t.initiatorName.toLowerCase().includes(entity.name.toLowerCase()) || 
      t.ownerName.toLowerCase().includes(entity.name.toLowerCase());
    return isMine;
  });

  const filteredTickets = visibleTickets.filter((t) => {
    if (filterStatus !== 'all' && t.coordinationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.drugName.toLowerCase().includes(q) ||
        t.initiatorName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.governorate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-900/50 text-slate-100" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                تذاكر التنسيق والشات الداخلي الآمن
                <span className="text-xs bg-purple-900/80 text-purple-200 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono">
                  {filteredTickets.length} تذكرة
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة المحادثات الخاصة لتأكيد الكميات وتبادل الهواتف بين الصيدليات والمستشفيات
              </p>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({visibleTickets.length})
          </button>
          <button
            onClick={() => setFilterStatus('approved_open')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              filterStatus === 'approved_open' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>المحادثات النشطة</span>
          </button>
          <button
            onClick={() => setFilterStatus('pending_approval')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              filterStatus === 'pending_approval' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>بانتظار القبول</span>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'completed' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            مكتملة
          </button>
        </div>
      </div>

      {/* Info Notice about Privacy and zero-cost WebSockets/P2P */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white">
            شات داخلي آمن ومجاني 100% — حماية خصوصية المنشآت الطبية
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            الشات الداخلي يعمل عبر خوادم المنصة (WebSocket / State) دون أي تكلفة على الصيدليات، ويحمي الأرقام من الاتصالات المزعجة والتطفل، ولا تظهر بيانات الاتصال المباشر إلا بعد موافقة الطرفين على التنسيق.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في التذاكر بالاسم الدوائي أو اسم الصيدلية أو المحافظة..."
          className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">لا توجد تذاكر تنسيق نشطة في هذا النطاق</p>
            <p className="text-xs text-slate-500 mt-1">
              عندما تضغط على "حجز العرض" أو "تلبية الاحتياج" لأي صنف في السوق، ستفتح تذكرة شات تلقائية للتنسيق هنا.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isOwner = entity.id === ticket.ownerEntityId || entity.name === ticket.ownerName;
            const otherParty = isOwner ? ticket.initiatorName : ticket.ownerName;
            const lastMsg = ticket.messages[ticket.messages.length - 1];

            return (
              <div
                key={ticket.id}
                onClick={() => onOpenChat(ticket)}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition">
                        {ticket.drugName}
                      </h3>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md">
                        {ticket.quantity} {ticket.unit}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ticket.coordinationStatus === 'approved_open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : ticket.coordinationStatus === 'completed'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {ticket.coordinationStatus === 'approved_open'
                          ? 'محادثة نشطة (تم تبادل الأرقام)'
                          : ticket.coordinationStatus === 'completed'
                          ? 'صفقة مكتملة'
                          : 'بانتظار قبول التنسيق'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>الطرف الآخر: <strong className="text-slate-200">{otherParty}</strong></span>
                      <span>•</span>
                      <span>{ticket.governorate}</span>
                    </p>

                    {lastMsg && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                        💬 {lastMsg.senderName}: "{lastMsg.text}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ticket.lastActivityAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChat(ticket);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                  >
                    <span>فتح الشات</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
