import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Stars, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  Gift, Scissors, Shirt, Trophy, ShieldCheck,
  Banknote, Zap, ArrowRight, Store, PackageCheck,
  TrendingUp, Star
} from "lucide-react";

/* ---------------------------------
   PART 1: ADVANCED 3D (NO MOUSE TRACKING)
---------------------------------- */

// Next-Gen Glass Gem
const CrystalGem = ({ position, color, speed, shape = "icosahedron" }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle auto-rotation only
      meshRef.current.rotation.x += delta * 0.2 * speed;
      meshRef.current.rotation.y += delta * 0.15 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2.5}>
      <mesh ref={meshRef} position={position}>
        {shape === "icosahedron" ? (
          <icosahedronGeometry args={[1.2, 0]} />
        ) : (
          <octahedronGeometry args={[1.2, 0]} />
        )}
        {/* Advanced Transmission Material for "Diamond" look */}
        <MeshTransmissionMaterial 
            backside
            backsideThickness={5}
            thickness={2} 
            roughness={0.1} 
            transmission={1} 
            ior={1.5} 
            chromaticAberration={1} 
            anisotropy={0.5}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.2}
            color={color}
            background={new THREE.Color("#09090b")}
        />
      </mesh>
    </Float>
  );
};

const Experience = () => {
  return (
    <>
      <Environment preset="city" />
      
      {/* Lighting setup */}
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#fff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#bd00ff" />
      
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1.5} />
      <Sparkles count={50} scale={12} size={4} speed={0.4} opacity={0.5} color="#fff" />

      {/* Gems placed nicely */}
      <CrystalGem position={[-4, 2, -2]} color="#FFD700" speed={1.2} shape="octahedron" />
      <CrystalGem position={[5, -2, -3]} color="#00CED1" speed={1.5} />
      <CrystalGem position={[0, 4, -8]} color="#8A2BE2" speed={0.8} />
      <CrystalGem position={[-6, -4, -5]} color="#FF4500" speed={1} shape="octahedron" />
      <CrystalGem position={[6, 3, -6]} color="#3b82f6" speed={1.3} />
    </>
  );
};

/* ---------------------------------
   PART 2: UI COMPONENTS (STATIC CARDS)
---------------------------------- */

// Removed HolographicCard (Cursor logic removed)
// Using standard styling with glass effect

const RewardCard = ({
  icon: Icon,
  title,
  subtitle,
  reward,
  accentColor = "blue",
  isPremium = false,
  badge,
  index
}) => {
  const colors = {
    blue: "from-blue-500 to-cyan-400",
    gold: "from-amber-400 via-yellow-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-400",
    purple: "from-violet-500 to-fuchsia-500"
  };

  const glowColors = {
    blue: "shadow-blue-500/10",
    gold: "shadow-amber-500/10",
    emerald: "shadow-emerald-500/10",
    purple: "shadow-violet-500/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`h-full group ${isPremium ? 'md:col-span-2' : ''}`}
    >
      <div className={`relative h-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[1.8rem] p-8 flex flex-col justify-between overflow-hidden shadow-2xl ${glowColors[accentColor]} hover:border-white/20 transition-colors duration-300`}>
        {/* Simple Gradient Blob instead of mouse tracking */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${colors[accentColor]} opacity-10 blur-[50px] rounded-full`}></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[accentColor]} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
              <Icon size={26} strokeWidth={2} />
            </div>
            {badge && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-white mb-2 leading-tight tracking-wide">
            {title}
          </h3>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Reward Unlocked</p>
          <div className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r ${colors[accentColor]}`}>
            {reward}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Live Counter (Kept as is - it's nice)
const LiveCounter = () => {
    const [count, setCount] = useState(12450);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + Math.floor(Math.random() * 100));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono tracking-wider mb-6 animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"/>
            <span>LIVE PAYOUTS TODAY: ₹{count.toLocaleString()}</span>
        </div>
    );
};

const RewardsSection = () => {
  const [activeTab, setActiveTab] = useState("user");
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-950 py-24 px-6 mt-13 dark-theme-area selection:bg-amber-500/30">
      
      {/* 3D Background - Static Camera */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 35 }} gl={{ antialias: true, alpha: true }}>
          <Experience />
        </Canvas>
      </div>
      
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(9,9,11,0.8)_100%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 flex flex-col items-center">
          <LiveCounter />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md"
          >
            <Gift size={14} className="text-amber-400" />
            <span>TrimGo Partner Program</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]"
          >
            Earn while you <br />
            <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient-x relative z-10">
                    Scale Up.
                </span>
                <span className="absolute -inset-1 bg-blue-500/20 blur-xl -z-10"></span>
            </span>
          </motion.h2>
          
          <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Get real-time rewards floating your way. <br />
            <span className="text-white font-bold decoration-amber-400 decoration-2 underline underline-offset-4">Users get free cuts, Salons get verified traffic.</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-20">
          <div className="p-1.5 bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-full inline-flex relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <motion.div
              layoutId="activeTab"
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-zinc-800 rounded-full shadow-lg border border-white/5`}
              initial={false}
              animate={{
                x: activeTab === 'user' ? 0 : "100%",
                left: activeTab === 'user' ? "6px" : "6px"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {['user', 'salon'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 px-12 py-3 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                {tab === 'user' ? <Star size={14} /> : <Store size={14} />}
                {tab === 'user' ? 'For Users' : 'For Salons'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grids */}
        <AnimatePresence mode="wait">
          {activeTab === 'user' ? (
            <motion.div
              key="user"
              initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <RewardCard
                index={0}
                icon={Banknote}
                title="The Scout"
                subtitle="Refer 2 salons. Once verified, ₹100 hits your wallet instantly."
                reward="₹100 Cash"
                accentColor="emerald"
              />
              <RewardCard
                index={1}
                icon={Trophy}
                title="The Ambassador"
                subtitle="Refer 10 verified salons. Unlock VIP status."
                reward="5 Free Haircuts + Merch"
                accentColor="gold"
                isPremium={true}
                badge="Elite Status"
              />
              <div className="rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 text-white flex flex-col justify-center relative shadow-2xl overflow-hidden hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full"></div>
                <ShieldCheck className="text-emerald-400 mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" size={36} />
                <h4 className="text-2xl font-black mb-3 relative z-10">Real Shops Only.</h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 relative z-10 font-medium">
                  Our AI verifies location and footfall. <span className="text-emerald-300">Fake entries = Immediate Ban.</span>
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 relative z-10 uppercase tracking-widest">
                  <Zap size={14} /> System Active
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="salon"
              initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="relative min-h-[350px] rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-between overflow-hidden hover:border-white/20 transition-colors">
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-purple-500/20 rounded-full blur-[80px]"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-white text-[10px] font-bold uppercase mb-6 border border-white/10">
                    <Store size={12} /> TrimGo Business
                  </div>
                  <h3 className="text-4xl font-black text-white mb-3">Daily Goals.</h3>
                  <p className="text-zinc-400 font-medium">Hit 5 bookings. Get Rewarded.</p>
                </div>
                <div className="relative z-10 bg-black/40 rounded-2xl p-5 border border-white/5 mt-8">
                  <div className="flex justify-between text-xs text-white font-bold mb-3 uppercase tracking-wider">
                    <span>Today's Progress</span>
                    <span className="text-emerald-400">100% Complete</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <RewardCard
                  index={3}
                  icon={Shirt}
                  title="Daily Champion"
                  subtitle="Accept and complete 5 bookings via TrimGo in a single day."
                  reward="TrimGo T-Shirt + Hamper"
                  accentColor="purple"
                />
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-md rounded-[2rem] p-8 border border-blue-500/30 flex items-center gap-6">
                  <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)] rotate-3">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Trend Boost 🚀</h4>
                    <p className="text-sm text-zinc-300 mt-1 font-medium leading-relaxed">
                      Consistent winners get the <span className="text-blue-300 font-bold">"Trending"</span> badge.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Merch Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-24 max-w-5xl mx-auto"
        >
             <div className="rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-900/10 overflow-hidden hover:border-white/20 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center relative z-10">
                    <div className="relative h-100 md:h-auto min-h-[350px] w-full overflow-hidden group">
                    <img
                        src="/tshirtandgoodies.png"
                        alt="TrimGo Official Merchandise Kit"
                        className="w-full h-full object-cover object-top transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60"></div>
                    
                    <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        <PackageCheck size={14} className="text-purple-400" /> Official Gear
                    </div>
                    </div>

                    <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center shadow-lg mb-8 rotate-3">
                        <Gift size={28} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Get the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">TrimGo Look.</span>
                    </h3>

                    <p className="text-zinc-400 text-base font-medium leading-relaxed mb-8 max-w-sm">
                        Top performers earn status. Unlock the exclusive Polo, premium bottle, and swag kit.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {['✨ Polo T-Shirt', '💧 Sipper', '🎁 Goodies'].map((item) => (
                            <div key={item} className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-white/5 text-xs text-zinc-300 font-bold hover:bg-zinc-700/50 transition-colors cursor-default">
                                {item}
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
             </div>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <button
            onClick={() => navigate("/register/salon")}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-black text-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              Start Earning Now <ArrowRight size={20} />
            </span>
          </button>
          <p className="mt-8 text-xs text-zinc-600 font-bold uppercase tracking-widest opacity-50">
            Terms & Conditions apply • Rewards subject to verification
          </p>
        </div>

      </div>
    </section>
  );
};

export default RewardsSection;