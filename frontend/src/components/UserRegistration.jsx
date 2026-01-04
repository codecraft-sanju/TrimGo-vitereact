import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Animation Library
import {
  User,
  Phone,
  Lock,
  CheckCircle,
  ArrowLeft, // Changed ChevronLeft to ArrowLeft for consistency
  Mail,
  MapPin,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
// 1. Import API Helper
import api from "../utils/api";
import toast from 'react-hot-toast';

/* -------------------------------------------------------------------------- */
/* ANIMATION VARIANTS (PREMIUM FEEL)                                          */
/* -------------------------------------------------------------------------- */

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

/* -------------------------------------------------------------------------- */
/* UI COMPONENTS                                                              */
/* -------------------------------------------------------------------------- */

const BackgroundAurora = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-500">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-300/10 rounded-full blur-[120px] animate-pulse" />
  </div>
);

const ShimmerButton = ({ children, onClick, className = "", disabled = false }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl font-bold transition-all duration-300 bg-black dark:bg-white text-white dark:text-black shadow-xl hover:shadow-2xl ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      type="submit"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-4">
        {disabled ? <Loader2 className="animate-spin" size={20} /> : children}
      </span>
    </motion.button>
  );
};

// --- PREMIUM INPUT GROUP (WITH FLOATING LABEL & PASSWORD TOGGLE) ---
const InputGroup = ({
  icon: Icon,
  type,
  label,
  name,
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div variants={fadeInUp} className="relative w-full mb-8 group">
      {/* Input Field with Underline Style */}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={inputType}
        placeholder=" " // Required for peer-focus trick
        className="peer w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 pl-0 pr-10 outline-none 
                   focus:border-black dark:focus:border-white transition-all duration-300 text-zinc-900 dark:text-white font-medium placeholder-transparent"
      />

      {/* Floating Label */}
      <label className="absolute left-0 top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
                        peer-focus:-top-4 peer-focus:text-black dark:peer-focus:text-white
                        peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-zinc-500">
        {label}
      </label>

      {/* Right Side Icon logic */}
      <div className="absolute right-0 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="focus:outline-none hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        ) : (
          <Icon size={20} />
        )}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* LAYOUT WRAPPER                                                             */
/* -------------------------------------------------------------------------- */

const AuthLayout = ({ children, title, subtitle, onBack, illustration }) => (
  <motion.div
    initial="initial"
    animate="animate"
    // Added pt-24 to prevent content from hiding behind the fixed header
    className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 relative font-sans overflow-hidden"
  >
    <BackgroundAurora />

    {/* --- NEW GLASS HEADER (CONSISTENT WITH SALON PAGE) --- */}
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-full px-2 py-2 pr-6 border border-white/50 dark:border-zinc-800 shadow-sm">
          <button
            onClick={onBack}
            className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-90 group"
          >
            <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Get Started</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-white">TrimGo</span>
          </div>
        </div>
      </div>
    </header>

    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">

      {/* LEFT SIDE: Form */}
      <motion.div
        variants={staggerContainer}
        className="w-full p-4 md:p-12 flex flex-col justify-center order-2 md:order-1"
      >
        <motion.div variants={fadeInUp} className="mb-10">
          <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tighter text-zinc-900 dark:text-white mb-3">
            {title}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {subtitle}
          </p>
        </motion.div>
        {children}
      </motion.div>

      {/* RIGHT SIDE: Illustration */}
      <motion.div variants={fadeInUp} className="hidden md:flex w-full relative p-12 flex-col justify-center order-1 md:order-2 h-full">
        <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col justify-center">
          {illustration}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/* MAIN LOGIC COMPONENT                                                       */
/* -------------------------------------------------------------------------- */

const UserRegistration = ({ onBack, onSuccess, onRegisterUser, onNavigateLogin }) => {
  // State from your original code
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [locationStatus, setLocationStatus] = useState("pending");
  const [locationLoading, setLocationLoading] = useState(false);

  // Geolocation Logic (Preserved exactly as requested)
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Location access granted at registration.");
        setLocationStatus("granted");
        setLocationLoading(false);
      },
      (err) => {
        console.log("❌ Location access denied:", err.message);
        setLocationStatus("denied");
        setLocationLoading(false);
        if (err.code === 1) {
          toast.error("Please enable location permissions in your browser settings.");
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    handleRequestLocation();
  }, []);

  // Submit Logic (Preserved exactly as requested)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        phone,
        password,
      });

      if (data.success) {
        if (onRegisterUser) {
          onRegisterUser(data.user);
        }
        toast.success("Account created successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Registration failed:", err);
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the queue from anywhere."
      onBack={onBack}
      illustration={
        // Updated Illustration to match Premium Theme
        <div className="h-full flex flex-col justify-center">
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-white/10 dark:bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 dark:border-white/10 shadow-lg">
              <User className="text-zinc-900 dark:text-white" size={32} />
            </div>
            <h3 className="text-4xl font-light text-zinc-900 dark:text-white mb-4 leading-tight tracking-tight">
              Your time is <br />
              <span className="font-bold italic">too valuable</span> <br />
              to wait.
            </h3>
          </div>
          <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-6 rounded-3xl relative z-10 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-zinc-900 dark:text-white font-bold">Booking Confirmed</p>
                <p className="text-zinc-500 text-sm">You are #3 in line</p>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>
      }
    >
      <form className="w-full" onSubmit={handleSubmit}>

        {/* Location Button - Re-styled for Premium Look but same logic */}
        <motion.div
          variants={fadeInUp}
          onClick={!locationLoading ? handleRequestLocation : undefined}
          className={`group flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer mb-8 ${locationStatus === "granted"
              ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800"
              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            } ${locationLoading ? "opacity-75 cursor-wait" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${locationStatus === "granted" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
              }`}>
              {locationLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <MapPin size={20} />
              )}
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${locationStatus === "granted" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"
                }`}>
                {locationLoading
                  ? "Locating..."
                  : locationStatus === "granted"
                    ? "Location Verified"
                    : "Enable Location"
                }
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight mt-1">
                {locationLoading ? "Please wait..." : "Required for live queue tracking"}
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          {!locationLoading && locationStatus !== "granted" && (
            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-sm group-hover:scale-105 transition-transform">
              Allow
            </span>
          )}
          {!locationLoading && locationStatus === "granted" && (
            <CheckCircle className="text-emerald-500" size={20} />
          )}
        </motion.div>

        {/* Error Display Removed - Handled by Toast */}

        {/* Inputs */}
        <InputGroup
          icon={User}
          type="text"
          label="Full Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputGroup
          icon={Mail}
          type="email"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputGroup
          icon={Phone}
          type="tel"
          label="Mobile Number"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <InputGroup
          icon={Lock}
          type="password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <ShimmerButton className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Free Account"}
          </ShimmerButton>
        </div>

        {/* Login Link */}
        <motion.div variants={fadeInUp} className="pt-6 text-center">
          <p className="text-zinc-500 text-sm font-medium">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-zinc-900 dark:text-white hover:underline hover:text-black transition-colors"
            >
              Log in here
            </button>
          </p>
        </motion.div>

      </form>
    </AuthLayout>
  );
};

export default UserRegistration;