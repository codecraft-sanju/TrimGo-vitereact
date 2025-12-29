import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Copy, Check, Share2, Users, 
  Gift, ShieldCheck, Truck, Sparkles, 
  Trophy, Lock, MessageCircle
} from "lucide-react";
import { motion } from "framer-motion"; 

/* --- ⚡ PERFORMANCE COMPONENT WRAPPERS --- */

// 1. Optimized Glass Card: Solid on Mobile (Fast), Glass on Desktop (Premium)
const GlassCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-zinc-100 md:border-white/40 bg-white/95 md:bg-white/60 md:backdrop-blur-xl shadow-lg shadow-zinc-200/50 ${className}`}>
    {/* Gradient only for Desktop to save Mobile GPU */}
    <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

// 2. Optimized Button: Reduced animation load on mobile
const ShimmerButton = ({ onClick, children, className = "" }) => (
  <button 
    onClick={onClick}
    className={`group relative overflow-hidden rounded-xl bg-zinc-900 px-6 py-3 font-bold text-white shadow-lg active:scale-95 transition-transform ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
    <span className="relative z-20 flex items-center justify-center gap-2">{children}</span>
  </button>
);

const ProgressBar = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="h-3 md:h-4 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60 p-[2px]">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/* --- 🚀 MAIN COMPONENT --- */
const ReferralPage = ({ user, onBack }) => {
  const [copied, setCopied] = useState(false);
  
  // Disable heavy animations on mobile for scroll performance
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Data
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
      try { await navigator.share(shareData); } catch (err) { console.log('Error sharing:', err); }
    } else {
      handleCopy();
      alert("Link copied to clipboard!");
    }
  };

  // Simplified Animations for Mobile (Prevents Jitter)
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    // ROOT: min-h-[100dvh] fixes mobile browser bar jump. touch-action-pan-y allows smooth native scroll.
    <div className="min-h-[100dvh] w-full bg-[#F2F4F8] font-sans text-zinc-900 relative touch-pan-y selection:bg-indigo-100">
      
      {/* --- OPTIMIZED BACKGROUND --- */}
      {/* Fixed position prevents repainting background on every scroll pixel */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden translate-z-0">
        {/* Simple gradients for mobile, Heavy blurs only for desktop */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-200/30 rounded-full blur-[40px] md:blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-200/30 rounded-full blur-[40px] md:blur-[100px]" />
        
        {/* Noise texture hidden on mobile to save GPU */}
        <div className="hidden md:block absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          {/* Mobile: Solid White/90. Desktop: Blur. Keeps header scroll smooth. */}
          <div className="flex items-center justify-between bg-white/90 md:bg-white/70 md:backdrop-blur-xl rounded-full px-2 py-2 pr-5 border border-white/50 shadow-sm">
            <button 
              onClick={onBack} 
              className="p-2.5 md:p-3 rounded-full bg-white shadow-sm border border-zinc-100 active:bg-zinc-100 transition-colors"
            >
              <ArrowLeft size={18} className="text-zinc-600" />
            </button>
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Partner Hub</span>
              <span className="text-sm font-bold text-zinc-800">TrimGo Elite</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-20 pt-24 md:pt-32">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">

          {/* 1. HERO CARD */}
          <motion.div 
            // Only animate once to save resources
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={fadeInUp}
            className="md:col-span-8"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900 p-6 md:p-10 text-white shadow-xl shadow-zinc-900/10 border border-zinc-800">
              {/* Static Background Glows for Performance */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/30 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] md:text-xs font-bold text-indigo-200 mb-5 md:mb-6">
                  <Sparkles size={12} />
                  <span>Refer & Earn Program</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 md:mb-4 leading-[1.15]">
                  Your Network. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                    Your Net Worth.
                  </span>
                </h1>
                <p className="text-zinc-400 text-sm md:text-lg max-w-md mb-6 md:mb-8 leading-relaxed">
                  Earn <span className="text-white font-bold">₹800 cash</span> + an exclusive Partner Kit for every 10 verified salons.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 md:gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-2 pl-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Your Code</span>
                      <span className="font-mono text-xl md:text-2xl font-bold tracking-widest text-white">{referralCode}</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-indigo-600 active:bg-indigo-500 flex items-center justify-center transition-colors"
                    >
                      {copied ? <Check size={18} className="text-white" /> : <Copy size={18} className="text-white" />}
                    </button>
                  </div>
                  <ShimmerButton onClick={handleShare} className="flex-1 sm:flex-none">
                    <Share2 size={18} /> Share Link
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. STATS & PROGRESS */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}
            className="md:col-span-4 flex flex-col gap-5 md:gap-6"
          >
             <GlassCard className="h-full p-5 md:p-6 flex flex-col justify-between">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Users size={18} />
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">Live Updates</span>
                   </div>
                   <span className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight block mb-1">
                      {referralCount} <span className="text-base md:text-lg text-zinc-400 font-medium">/ 10</span>
                   </span>
                   <p className="text-sm text-zinc-500 font-medium">Verified Salons</p>
                </div>

                <div className="mt-6 md:mt-0">
                  <div className="flex justify-between text-[10px] md:text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                    <span>Progress</span>
                    <span className="text-indigo-600">{10 - (referralCount % 10)} to go</span>
                  </div>
                  <ProgressBar current={referralCount} max={10} />
                </div>
             </GlassCard>
          </motion.div>

          {/* 3. REWARDS TRACKER */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }}
            className="md:col-span-7"
          >
             <GlassCard className="h-full p-5 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Trophy size={20} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-zinc-900">Unlock Rewards</h3>
                </div>

                <div className="space-y-3 md:space-y-4">
                   {/* Reward 1 */}
                   <div className={`relative p-3 md:p-4 rounded-2xl border ${referralCount >= 5 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-zinc-50 border-zinc-100'}`}>
                      <div className="flex items-center gap-3 md:gap-4 relative z-10">
                          <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2 text-sm font-bold ${referralCount >= 5 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-zinc-200 text-zinc-300'}`}>
                             {referralCount >= 5 ? <Check size={16} strokeWidth={3} /> : "1"}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-sm md:text-base text-zinc-900">5 Verified Salons</h4>
                             <p className="text-[10px] md:text-xs text-zinc-500 font-medium">₹300 Cash Bonus</p>
                          </div>
                          {referralCount >= 5 ? (
                             <span className="px-2 py-1 rounded-full bg-white border border-emerald-100 text-emerald-600 text-[10px] font-bold">Paid</span>
                          ) : (
                             <Lock size={14} className="text-zinc-300" />
                          )}
                      </div>
                   </div>

                   {/* Reward 2 */}
                   <div className={`relative p-3 md:p-4 rounded-2xl border ${referralCount >= 10 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-zinc-100'}`}>
                      <div className="flex items-center gap-3 md:gap-4 relative z-10">
                          <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2 text-sm font-bold ${referralCount >= 10 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-200 text-zinc-300'}`}>
                             {referralCount >= 10 ? <Gift size={16} /> : "2"}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-sm md:text-base text-zinc-900">10 Verified Salons</h4>
                             <p className="text-[10px] md:text-xs text-zinc-500 font-medium">₹800 Cash + Welcome Kit</p>
                          </div>
                          {referralCount >= 10 ? (
                             <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold">Claim</span>
                          ) : (
                             <div className="h-7 w-7 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                                <Lock size={12} className="text-zinc-300" />
                             </div>
                          )}
                      </div>
                   </div>
                </div>
             </GlassCard>
          </motion.div>

          {/* 4. MERCH SHOWCASE */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.3 }}
            className="md:col-span-5"
          >
             <div className="h-full relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-[#FFF5F5] border border-pink-100 p-6 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="inline-block px-2 py-1 rounded-md bg-pink-100 text-pink-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                    Milestone Reward
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 leading-tight">
                    TrimGo <span className="text-pink-500">Partner Kit</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">T-Shirt • Apron • Window Stickers</p>
                </div>
                
                {/* Image Section - Static on mobile to prevent paint lag */}
                <div className="relative h-28 md:h-40 w-full flex items-center justify-center mt-2">
                   {/* Blur only on desktop */}
                  <div className="absolute inset-0 bg-pink-200/40 rounded-full md:blur-3xl opacity-50 translate-y-4" />
                  <img 
                    src="/tshirtgoodies.png" 
                    alt="Kit" 
                    className="relative z-10 w-32 md:w-40 drop-shadow-xl"
                    onError={(e) => {
                      e.target.style.display = 'none'; 
                    }} 
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                   <Truck size={12} />
                   <span>Free Shipping • India Wide</span>
                </div>
             </div>
          </motion.div>

          {/* 5. VERIFICATION STEPS */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.4 }}
            className="md:col-span-12"
          >
            <GlassCard className="p-5 md:p-8">
                <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-500" size={20} />
                  How it works
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-6 md:mb-8">
                  <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-zinc-100 -z-10" />
                  {[
                    { title: "Register", desc: "Salon uses your code", icon: "1" },
                    { title: "AI Check", desc: "Location & Photos verified", icon: "2" },
                    { title: "Get Paid", desc: "Rewards credited instantly", icon: "3" }
                  ].map((step, i) => (
                    <div key={i} className="flex md:flex-col items-center gap-4 md:text-center">
                       <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border-2 border-zinc-100 flex items-center justify-center font-black text-base md:text-lg text-zinc-300 shadow-sm">
                          {step.icon}
                       </div>
                       <div>
                          <h4 className="font-bold text-zinc-900 text-sm md:text-base">{step.title}</h4>
                          <p className="text-xs md:text-sm text-zinc-500">{step.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <MessageCircle size={20} />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-zinc-900 text-sm md:text-lg">
                        Automated Shipping
                      </h4>
                      <p className="text-zinc-600 text-xs md:text-sm mt-1 leading-relaxed">
                        Hit <span className="font-bold text-zinc-900">10 referrals</span> and we automatically WhatsApp you for delivery details.
                      </p>
                  </div>
                </div>
            </GlassCard>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default ReferralPage;