import React, { useState, useEffect } from "react";
import { 
  Calendar, DollarSign, Users, Clock, Scissors, 
  Search, UserIcon // Changed from User to UserIcon to avoid variable conflict
} from "lucide-react";
import api from "../utils/api";

const SalonHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today"); // 'today', 'week', 'month'

  useEffect(() => {
    fetchHistory();
  }, [period]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/queue/salon-history-data?period=${period}`);
      if (data.success) {
        setHistory(data.history);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-5 rounded-3xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-emerald-400" size={24} /> History & Reports
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Track your earnings and completed services.</p>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/10">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "7 Days" },
            { id: "month", label: "30 Days" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                period === tab.id 
                  ? "bg-zinc-800 text-white shadow-md" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-white">₹{stats.revenue}</h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <DollarSign size={28} />
          </div>
        </div>
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Completed Services</p>
            <h3 className="text-3xl font-black text-white">{stats.customers}</h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Users size={28} />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-zinc-100 flex items-center gap-2">
            <Clock size={16} /> Service Log
          </h3>
          <div className="text-xs font-bold text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/10">
            {history.length} Records
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                <Search className="text-zinc-600" size={24} />
              </div>
              <p className="text-zinc-400 font-medium">No history found for this period.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 text-zinc-400 text-[10px] uppercase tracking-widest">
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Services</th>
                  <th className="p-4 font-bold">Staff</th>
                  <th className="p-4 font-bold">Time & Date</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {(ticket.userId?.name || ticket.guestName || "U").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{ticket.userId?.name || ticket.guestName || "Walk-in"}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">#{ticket.queueNumber || "..."}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {ticket.services.map((s, i) => (
                          <span key={i} className="text-xs text-zinc-300 flex items-center gap-1.5">
                            <Scissors size={10} className="text-emerald-500" /> {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 border border-white/5 text-[10px] font-bold text-zinc-300">
                        <UserIcon size={10} /> {ticket.assignedStaff || "Any"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">{formatTime(ticket.updatedAt)}</p>
                      <p className="text-[10px] text-zinc-500">{formatDate(ticket.updatedAt)}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-lg font-black text-emerald-400">₹{ticket.totalPrice}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Paid</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonHistory;