"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  CheckCircle,
  ChevronLeft,
  LogIn,
  Store // Icon for salon link
} from "lucide-react";
// 1. Import API Helper
import api from "../utils/api";

/* -------------------------------------------------------------------------- */
/* UI COMPONENTS                                                              */
/* -------------------------------------------------------------------------- */

const BackgroundAurora = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/20 rounded-full blur-[120px] animate-blob" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-300/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
    <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-[120px] animate-blob animation-delay-4000" />
  </div>
);

const NoiseOverlay = () => (
  <div className="fixed inset-0 z-40 pointer-events-none opacity-[0.04] mix-blend-overlay">
    <svg className="w-full h-full">
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.80"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

const ShimmerButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 hover:shadow-2xl hover:shadow-zinc-900/30 ${className}`}
      type="submit"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-3.5">
        {children}
      </span>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* LAYOUT & HELPERS                                                           */
/* -------------------------------------------------------------------------- */

const AuthLayout = ({ children, title, subtitle, onBack, illustration }) => (
  <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4 relative font-sans overflow-hidden">
    <BackgroundAurora />
    <NoiseOverlay />

    <button
      onClick={onBack}
      className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition z-20 font-bold bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50"
    >
      <ChevronLeft size={20} /> Home
    </button>

    <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60">
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-zinc-900 mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-zinc-500 font-medium">{subtitle}</p>
        </div>
        {children}
      </div>

      <div className="hidden md:flex w-1/2 bg-zinc-900 relative p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        {illustration}
      </div>
    </div>
  </div>
);

const InputGroup = ({
  icon: Icon,
  type,
  placeholder,
  label,
  name,
  value,
  onChange,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
        size={20}
      />
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full bg-zinc-5 border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-900 font-medium focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
      />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const UserLogin = ({ 
  onBack, 
  onSuccess, 
  onLogin, 
  onNavigateSalonLogin // <--- NEW PROP ADDED HERE
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
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
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err.response?.data?.message || "Login failed. Please check credentials.";
      setError(msg);
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
        <>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <LogIn className="text-white" size={32} />
            </div>
            <h3 className="text-4xl font-bold text-white mb-4 leading-tight">
              Back to
              <br />
              your place
              <br />
              in line.
            </h3>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white font-bold">Instant Access</p>
                <p className="text-zinc-400 text-sm">
                  View and manage your queue in seconds.
                </p>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-sky-500 rounded-full"></div>
            </div>
          </div>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        
        {error && (
          <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 animate-pulse">
            {error}
          </p>
        )}

        <InputGroup
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputGroup
          icon={Lock}
          type="password"
          placeholder="••••••••"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Use the email you registered with.</span>
          <button
            type="button"
            className="font-semibold text-zinc-900 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <ShimmerButton className="w-full py-4 mt-4" disabled={loading}>
          {loading ? (
            "Signing you in..."
          ) : (
            <>
              Login <LogIn size={18} />
            </>
          )}
        </ShimmerButton>
      </form>

      {/* --- ADDED: Link to Salon Login --- */}
      <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
        <p className="text-zinc-500 font-medium flex items-center justify-center gap-2">
           <Store size={16} /> Are you a business?{" "}
          <button 
            type="button"
            onClick={onNavigateSalonLogin} 
            className="text-zinc-900 font-bold hover:underline"
          >
            Partner Login
          </button>
        </p>
      </div>

    </AuthLayout>
  );
};

export default UserLogin;