import React, { useState } from "react";
import { motion } from "framer-motion"; // Animation Library
import {
  Mail,
  Lock,
  CheckCircle,
  ArrowLeft, // Changed ChevronLeft to ArrowLeft for consistency
  LogIn,
  Store,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from "lucide-react";
// 1. Import API Helper
import api from "../utils/api";
import toast from 'react-hot-toast';

/* -------------------------------------------------------------------------- */
/* ANIMATION VARIANTS                                                         */
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
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-3">
        {disabled ? <Loader2 className="animate-spin" size={20} /> : children}
      </span>
    </motion.button>
  );
};

// --- PREMIUM INPUT GROUP (Floating Label & Password Toggle) ---
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
      {/* Input Field */}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={inputType}
        placeholder=" " // Required for floating label logic
        className="peer w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 pl-0 pr-10 outline-none 
                   focus:border-black dark:focus:border-white transition-all duration-300 text-zinc-900 dark:text-white font-medium placeholder-transparent"
      />

      {/* Floating Label */}
      <label className="absolute left-0 top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
                        peer-focus:-top-4 peer-focus:text-black dark:peer-focus:text-white
                        peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-zinc-500">
        {label}
      </label>

      {/* Right Side Icon */}
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
    // Added pt-24 to prevent content being hidden by fixed header
    className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 relative font-sans overflow-hidden"
  >
    <BackgroundAurora />

    {/* --- NEW GLASS HEADER --- */}
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
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">user Access</span>
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
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const UserLogin = ({
  onBack,
  onSuccess,
  onLogin,
  onNavigateSalonLogin
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        identifier: email,
        password: password,
      });

      if (data.success) {
        if (onLogin) {
          await onLogin(data.user);
        }
        toast.success(`Welcome back, ${data.user.name}!`);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err.response?.data?.message || "Login failed. Please check credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to manage your bookings."
      onBack={onBack}
      illustration={
        <div className="h-full flex flex-col justify-center">
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-white/10 dark:bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 dark:border-white/10 shadow-lg">
              <LogIn className="text-zinc-900 dark:text-white" size={32} />
            </div>
            <h3 className="text-4xl font-light text-zinc-900 dark:text-white mb-4 leading-tight tracking-tight">
              Back to <br />
              <span className="font-bold italic">your place</span> <br />
              in line.
            </h3>
          </div>
          <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-6 rounded-3xl relative z-10 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-zinc-900 dark:text-white font-bold">Instant Access</p>
                <p className="text-zinc-500 text-sm">View and manage your queue in seconds.</p>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-sky-500 rounded-full"></div>
            </div>
          </div>
        </div>
      }
    >
      <form className="w-full" onSubmit={handleSubmit}>


        {/* Error Display Removed - Handled by Toast */}

        <InputGroup
          icon={Mail}
          type="email"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputGroup
          icon={Lock}
          type="password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.div variants={fadeInUp} className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-6">
          <span>Use the email you registered with.</span>
          <button
            type="button"
            className="text-zinc-900 dark:text-white hover:underline transition-colors"
          >
            Forgot password?
          </button>
        </motion.div>

        <ShimmerButton className="w-full py-1" disabled={loading}>
          {loading ? (
            "Signing you in..."
          ) : (
            <>
              Login <LogIn size={18} />
            </>
          )}
        </ShimmerButton>
      </form>

      {/* --- Salon Login Link --- */}
      <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <p className="text-zinc-500 text-sm font-medium flex items-center justify-center gap-2">
          <Store size={16} /> Are you a business?{" "}
          <button
            type="button"
            onClick={onNavigateSalonLogin}
            className="text-zinc-900 dark:text-white font-bold hover:underline"
          >
            Partner Login
          </button>
        </p>
      </motion.div>

    </AuthLayout>
  );
};

export default UserLogin;