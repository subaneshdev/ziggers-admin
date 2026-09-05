import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Send,
  AlertCircle,
  User
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { SupportTicketRecord } from '../../types/admin';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const SupportTicketsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'REPLIED' | 'CLOSED'>('ALL');
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['supportTicketsList'],
    queryFn: () => adminApi.fetchSupportTicketsList(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'OPEN' | 'REPLIED' | 'CLOSED' }) =>
      adminApi.updateSupportTicketStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supportTicketsList'] });
      success(
        'Ticket Updated',
        `Support ticket ${variables.id.slice(0, 8)} set to ${variables.status}.`
      );
      setReplyMessage('');
    },
    onError: (err: any) => {
      error('Update Failed', err.message || 'Could not update ticket status.');
    },
  });

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userPhone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0] || null;

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const repliedCount = tickets.filter(t => t.status === 'REPLIED').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            Support Tickets & Escalation Desk
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Real-time support ticket resolution console linked directly to Supabase support_tickets ({tickets.length} total)
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Open Escalations</span>
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-xl font-extrabold text-[#D97706] mt-1">{openCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Requires admin response</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Replied / In Progress</span>
            <MessageSquare className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-xl font-extrabold text-[#C69432] mt-1">{repliedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Response sent to user</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Resolved / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F8B5F] mt-1">{closedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Closed tickets</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#C69432] ml-1" />
          <span className="text-[11px] text-[#665C54] font-semibold uppercase">Filter Status:</span>
          {(['ALL', 'OPEN', 'REPLIED', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white border border-[#2C221E]'
                  : 'bg-[#F0EBE1] text-[#5C524B] hover:text-[#2C221E] border border-[#EBE4D8]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket subject, user..."
            className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
          />
        </div>
      </div>

      {/* Main Grid: Ticket List & Detailed Response Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Tickets List */}
        <div className="lg:col-span-2 space-y-2.5">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
              <MessageSquare className="w-10 h-10 text-[#C69432] mb-2" />
              <h3 className="text-sm font-bold text-[#2C221E]">No Support Tickets Found</h3>
              <p className="text-xs text-[#665C54] mt-0.5">Adjust search query or filter parameters.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2C221E] text-white border-[#2C221E] font-bold shadow-md'
                      : 'bg-[#FFFFFF] border-[#EBE4D8] hover:bg-[#F0EBE1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold">{t.subject}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-numeric font-bold uppercase ${
                        isSelected ? 'bg-white/10 text-[#C69432] border border-white/20' : 'bg-[#C69432]/10 text-[#C69432] border border-[#C69432]/30'
                      }`}>
                        {t.category}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                        t.status === 'OPEN'
                          ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                          : t.status === 'REPLIED'
                          ? 'bg-[#C69432]/15 text-[#C69432] border-[#C69432]/30'
                          : 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className={`text-xs mt-1.5 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-[#5C524B]'}`}>{t.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-[#EBE4D8]/30 flex items-center justify-between text-[11px] font-numeric">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold flex items-center space-x-1">
                        <User className="w-3 h-3 text-[#C69432]" />
                        <span>{t.userName}</span>
                      </span>
                      <span className="flex items-center space-x-1 opacity-80">
                        <Phone className="w-3 h-3 text-[#C69432]" />
                        <span>{t.userPhone}</span>
                      </span>
                    </div>
                    <span className="flex items-center space-x-1 opacity-70">
                      <Clock className="w-3 h-3 text-[#8C827A]" />
                      <span>{formatDate(t.createdAt)}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Column: Ticket Response & Action Inspector */}
        <div>
          {activeTicket ? (
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
              <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-2">
                <span className="text-[11px] font-numeric font-bold text-[#C69432] uppercase">Ticket Response Console</span>
                <span className="text-[10px] font-numeric text-[#665C54]">ID: {activeTicket.id.slice(0, 8)}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#2C221E]">{activeTicket.subject}</h3>
                <div className="flex items-center space-x-2 text-[11px] text-[#665C54] mt-0.5 font-numeric">
                  <span className="text-[#C69432] font-bold">{activeTicket.userName}</span>
                  <span>•</span>
                  <span>{activeTicket.userPhone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-xs text-[#2C221E] space-y-1 font-numeric">
                <div className="text-[10px] font-bold text-[#665C54] uppercase">User Message:</div>
                <p className="leading-relaxed">{activeTicket.description}</p>
              </div>

              {/* Admin Reply Form */}
              <div className="space-y-2 pt-1 border-t border-[#EBE4D8]">
                <label className="text-[11px] font-semibold text-[#665C54] uppercase block">Response Message:</label>
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Official admin support resolution..."
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl p-2.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate({ id: activeTicket.id, status: 'REPLIED' })}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1 border border-[#EBE4D8] min-h-[36px] shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C69432]" />
                    <span>Send Reply</span>
                  </button>

                  <button
                    disabled={updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate({ id: activeTicket.id, status: 'CLOSED' })}
                    className="py-2 px-3 rounded-xl bg-[#0F8B5F]/15 hover:bg-[#0F8B5F]/30 text-[#0F8B5F] border border-[#0F8B5F]/30 text-xs font-bold transition-colors flex items-center justify-center space-x-1 min-h-[36px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Close Ticket</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center space-y-2 flex flex-col items-center justify-center min-h-[260px] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
              <MessageSquare className="w-8 h-8 text-[#C69432]" />
              <h3 className="text-xs font-bold text-[#2C221E]">Select Ticket to Respond</h3>
              <p className="text-[11px] text-[#665C54] max-w-xs">
                Click any ticket on the left to inspect and send official resolution replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
