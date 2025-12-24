import React from "react";
import { 
  ArrowLeft, Copy, Gift, ShieldCheck, Banknote, Users, ChevronRight 
} from "lucide-react";
import { BackgroundAurora, NoiseOverlay } from "./SharedUI";

const ReferralPage = ({ user, onBack }) => {
  
  const handleCopyCode = () => {
    if(user?.referralCode) {
        navigator.clipboard.writeText(user.referralCode);
        alert(`Copied Code: ${user.referralCode}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans relative overflow-x-hidden">
      <BackgroundAurora />
      <NoiseOverlay />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-zinc-900">Partner Program</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12 relative z-10">
        
        {/* --- MAIN DASHBOARD BANNER (Moved Here) --- */}
        <div className="bg-zinc-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-2xl border border-zinc-800 group mb-8">
             <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 border border-zinc-700">
                    <Gift size={32} className="text-emerald-400" />
                 </div>
                 
                 <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Invite Salons & Earn</h2>
                 <p className="text-zinc-400 text-base max-w-lg mb-8">
                    Help us expand the TrimGo network. Share your agent code with salon owners. When they register using your code, you get rewarded.
                 </p>

                 {/* CODE BOX */}
                 <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                     <div className="flex items-center justify-between gap-4 bg-white/10 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md w-full hover:bg-white/15 transition-colors group/box">
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Your Agent Code</span>
                            <span className="text-2xl font-mono font-black tracking-widest text-white">{user?.referralCode || "---"}</span>
                         </div>
                         <button 
                            onClick={handleCopyCode} 
                            className="p-3 bg-white text-zinc-900 rounded-xl hover:scale-105 transition active:scale-95 shadow-lg"
                            title="Copy Code"
                         >
                             <Copy size={20} />
                         </button>
                     </div>
                     <p className="text-[10px] text-zinc-500">Tap copy icon to share</p>
                 </div>
             </div>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-zinc-900 mb-1">{user?.referredSalons?.length || 0}</span>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Salons Onboarded</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-50 opacity-50"></div>
                <span className="text-4xl font-black text-emerald-600 mb-1 relative z-10">₹{(user?.referredSalons?.length || 0) * 500}</span>
                <span className="text-xs font-bold text-emerald-700/60 uppercase tracking-wider relative z-10">Potential Earnings</span>
            </div>
        </div>

        {/* --- HOW IT WORKS --- */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h3 className="font-bold text-lg text-zinc-900 mb-6">How it works</h3>
            <div className="space-y-6">
                {[
                    { icon: Users, title: "Find Salon Owners", desc: "Talk to your local barber or salon owner about TrimGo." },
                    { icon: ShieldCheck, title: "Share Your Code", desc: "Ask them to enter your Agent Code during registration." },
                    { icon: Banknote, title: "Get Rewarded", desc: "Receive payout once the salon completes verification." }
                ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-600">
                            <step.icon size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-900 text-sm">{step.title}</h4>
                            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
};

export default ReferralPage;