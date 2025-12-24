import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Copy, Check, Share2, Users, 
  Gift, ShieldCheck, Truck, Sparkles, 
  Trophy, Lock, MessageCircle, RefreshCw
} from "lucide-react";

/* --- 🎨 ADVANCED UI COMPONENTS --- */

const ShimmerButton = ({ onClick, children, className = "" }) => (
  <button 
    onClick={onClick}
    className={`group relative overflow-hidden rounded-xl bg-zinc-900 px-6 py-3 font-bold text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] active:scale-95 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
    <span className="relative z-20 flex items-center justify-center gap-2">{children}</span>
  </button>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/60 backdrop-blur-xl shadow-xl shadow-zinc-200/50 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const ProgressBar = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60 p-[2px]">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/* --- 🚀 MAIN COMPONENT --- */
const ReferralPage = ({ user, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dynamic stats based on user prop
  const referralCode = user?.referralCode || "TRIM-VIP-24";
  const referralCount = user?.referredSalons?.length || 0; 

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join TrimGo Partner Program',
      text: `Register your salon on TrimGo using code ${referralCode} to get a Welcome Kit!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy();
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F4F8] font-sans text-zinc-900 selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-md rounded-full px-2 py-2 pr-6 border border-white/50 shadow-sm">
            <button 
              onClick={onBack} 
              className="p-3 rounded-full bg-white shadow-sm border border-zinc-100 hover:bg-zinc-50 transition-all active:scale-90 group"
            >
              <ArrowLeft size={20} className="text-zinc-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Partner Hub</span>
              <span className="text-sm font-bold text-zinc-800">TrimGo Elite</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-20 pt-6">
        
        {/* === BENTO GRID LAYOUT === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* 1. HERO CARD */}
          <div className="md:col-span-8 group perspective-1000">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-8 md:p-10 text-white shadow-2xl shadow-zinc-900/20 border border-zinc-800 transition-transform duration-500 hover:scale-[1.01]">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-bold text-indigo-300 mb-6">
                  <Sparkles size={12} />
                  <span>Refer & Earn Program</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
                  Your Network. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                    Your Net Worth.
                  </span>
                </h1>
                <p className="text-zinc-400 text-lg max-w-md mb-8 leading-relaxed">
                  Earn <span className="text-white font-bold">₹800 cash</span> + an exclusive Partner Kit for every 10 verified salons.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 pl-5 flex items-center justify-between backdrop-blur-md">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Your Code</span>
                      <span className="font-mono text-2xl font-bold tracking-widest text-white">{referralCode}</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-90"
                    >
                      {copied ? <Check size={20} className="text-white" /> : <Copy size={20} className="text-white" />}
                    </button>
                  </div>
                  <ShimmerButton onClick={handleShare} className="flex-1 sm:flex-none">
                    <Share2 size={18} /> Share Link
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STATS & PROGRESS */}
          <div className="md:col-span-4 flex flex-col gap-6">
             <GlassCard className="h-full p-6 flex flex-col justify-between group">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Users size={20} />
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">Live</span>
                   </div>
                   <span className="text-4xl font-black text-zinc-900 tracking-tight block mb-1">
                      {referralCount} <span className="text-lg text-zinc-400 font-medium">/ 10</span>
                   </span>
                   <p className="text-sm text-zinc-500 font-medium">Verified Salons</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                    <span>Progress</span>
                    <span className="text-indigo-600">
                      {10 - (referralCount % 10)} to go
                    </span>
                  </div>
                  <ProgressBar current={referralCount} max={10} />
                  {referralCount >= 10 && (
                     <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
                        <div className="p-1.5 bg-emerald-500 rounded-full text-white"><Check size={12} strokeWidth={3} /></div>
                        <span className="text-xs font-bold text-emerald-800">Milestone Unlocked!</span>
                     </div>
                  )}
                </div>
             </GlassCard>
          </div>

          {/* 3. REWARDS TRACKER */}
          <div className="md:col-span-7">
             <GlassCard className="h-full p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Trophy size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">Unlock Rewards</h3>
                </div>

                <div className="space-y-4">
                   <div className={`relative group p-4 rounded-2xl border transition-all duration-300 ${referralCount >= 5 ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-100' : 'bg-zinc-50 border-zinc-100 opacity-80'}`}>
                      <div className="flex items-center gap-4 relative z-10">
                         <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 text-lg font-bold transition-all ${referralCount >= 5 ? 'bg-emerald-500 border-emerald-200 text-white shadow-lg shadow-emerald-200' : 'bg-white border-zinc-200 text-zinc-300'}`}>
                            {referralCount >= 5 ? <Check size={20} strokeWidth={3} /> : "1"}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-zinc-900">5 Verified Salons</h4>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">₹300 Cash Bonus</p>
                         </div>
                         {referralCount >= 5 ? (
                            <span className="px-3 py-1 rounded-full bg-white border border-emerald-100 text-emerald-600 text-xs font-bold shadow-sm">Paid</span>
                         ) : (
                            <Lock size={16} className="text-zinc-300" />
                         )}
                      </div>
                   </div>

                   <div className={`relative group p-4 rounded-2xl border transition-all duration-300 ${referralCount >= 10 ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100' : 'bg-white border-zinc-100'}`}>
                      <div className="flex items-center gap-4 relative z-10">
                         <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 text-lg font-bold transition-all ${referralCount >= 10 ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg shadow-indigo-200' : 'bg-white border-zinc-200 text-zinc-300'}`}>
                            {referralCount >= 10 ? <Gift size={20} /> : "2"}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-zinc-900">10 Verified Salons</h4>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">₹800 Cash + Premium Welcome Kit</p>
                         </div>
                         {referralCount >= 10 ? (
                            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-200">Claim</span>
                         ) : (
                            <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                               <Lock size={14} className="text-zinc-300" />
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </GlassCard>
          </div>

          {/* 4. MERCH SHOWCASE - RE-ADDED ORIGINAL IMAGE LOGIC */}
          <div className="md:col-span-5">
             <div className="h-full relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FFEEEE] via-[#FFF5F5] to-white border border-pink-100 p-8 flex flex-col justify-between group">
                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-[10px] font-bold uppercase tracking-widest mb-3">
                    Milestone Reward
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 leading-tight">
                    The <span className="text-pink-500">TrimGo</span> <br/>
                    Partner Kit.
                  </h3>
                  <p className="text-sm text-zinc-500 mt-2 font-medium">T-Shirt • Apron • Window Stickers</p>
                </div>
                
                {/* Image Section */}
                <div className="relative h-48 w-full flex items-center justify-center mt-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-200/50 to-transparent rounded-full blur-3xl opacity-50 translate-y-10 group-hover:opacity-80 transition-opacity duration-700" />
                  <img 
                    src="/tshirtgoodies.png" 
                    alt="Kit" 
                    className="relative z-10 w-48 drop-shadow-2xl transition-transform duration-700 ease-in-out group-hover:-translate-y-4 group-hover:scale-105 group-hover:rotate-3"
                    onError={(e) => {
                      e.target.style.display = 'none'; 
                      e.target.parentElement.innerHTML += '<div class="text-pink-300 font-bold text-xl">KIT IMAGE</div>'; 
                    }} 
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">
                   <Truck size={12} />
                   <span>Free Shipping • India Wide</span>
                </div>
             </div>
          </div>

          {/* 5. VERIFICATION STEPS */}
          <div className="md:col-span-12">
            <GlassCard className="p-8">
                <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-500" size={20} />
                  Verification Lifecycle
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-8">
                  <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-gradient-to-r from-zinc-200 via-zinc-200 to-transparent -z-10" />
                  {[
                    { title: "Register", desc: "Salon uses your code", icon: "1" },
                    { title: "AI Check", desc: "Location & Photos verified", icon: "2" },
                    { title: "Get Paid", desc: "Rewards credited instantly", icon: "3" }
                  ].map((step, i) => (
                    <div key={i} className="flex md:flex-col items-center gap-4 md:text-center group">
                       <div className="w-12 h-12 rounded-2xl bg-white border-2 border-zinc-100 flex items-center justify-center font-black text-lg text-zinc-300 shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300">
                          {step.icon}
                       </div>
                       <div>
                          <h4 className="font-bold text-zinc-900">{step.title}</h4>
                          <p className="text-sm text-zinc-500">{step.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                     <MessageCircle size={24} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                        Shipping & Delivery
                        <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full uppercase tracking-wider">Automated</span>
                     </h4>
                     <p className="text-zinc-600 text-sm mt-1 leading-relaxed">
                        Once you hit <span className="font-bold text-zinc-900">10 referrals</span>, our team will automatically contact you via <span className="font-bold text-emerald-600">WhatsApp</span> to confirm your shipping address for the Welcome Kit.
                     </p>
                  </div>
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors">
                     <Truck size={14} /> Track Status
                  </button>
                </div>
            </GlassCard>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReferralPage;