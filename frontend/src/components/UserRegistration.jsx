import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Lock,
  CheckCircle,
  ChevronLeft,
  Mail,
  MapPin,
  AlertCircle,
  LogIn,
  // Added Eye and EyeOff icons
  Eye,
  EyeOff,
} from "lucide-react";
// 1. Import API Helper
import api from "../utils/api";

/* -------------------------------------------------------------------------- */
/* CUSTOM STYLES & ANIMATIONS                                                 */
/* -------------------------------------------------------------------------- */

const AnimationStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/* UI COMPONENTS (No changes here)                                            */
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
/* LAYOUT & HELPERS (Updated for Best Responsive Layout)                        */
/* -------------------------------------------------------------------------- */

const AuthLayout = ({ children, title, subtitle, onBack, illustration }) => (
  <div className="min-h-[100dvh] w-full bg-zinc-50 flex items-center justify-center p-4 sm:p-6 md:p-8 relative font-sans overflow-x-hidden">
    <AnimationStyles />
    <BackgroundAurora />
    <NoiseOverlay />

    {/* DESKTOP NAV: Floating Top Left (Hidden on Mobile) */}
    <button
      onClick={onBack}
      className="hidden md:flex absolute top-8 left-8 items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all z-20 font-bold bg-white/50 hover:bg-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 hover:border-zinc-200 shadow-sm"
    >
      <ChevronLeft size={20} /> Home
    </button>

    {/* MAIN CARD CONTAINER - Added Animation */}
    <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60 animate-fade-in-up">
      
      {/* LEFT SIDE: Form Area */}
      <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center">
        
        {/* MOBILE NAV: Inline Top Left (Hidden on Desktop) */}
        <div className="md:hidden flex justify-start mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm bg-zinc-100/80 px-3 py-1.5 rounded-full"
          >
            <ChevronLeft size={16} /> Back
          </button>
        </div>

        <div className="mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-2 md:mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-zinc-500 font-medium text-sm md:text-base">
            {subtitle}
          </p>
        </div>
        {children}
      </div>

      {/* RIGHT SIDE: Illustration (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 bg-zinc-900 relative p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        {illustration}
      </div>
    </div>
  </div>
);

// --- MODIFIED INPUT GROUP FOR PASSWORD TOGGLE ---
const InputGroup = ({
  icon: Icon,
  type,
  placeholder,
  label,
  name,
  value,
  onChange,
}) => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Check if this input is meant to be a password field
  const isPasswordType = type === "password";
  
  // Dynamic type: if showing password, becomes 'text', else stays as 'password' (or original type)
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
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
          type={inputType}
          placeholder={placeholder}
          // Added pr-12 (padding-right) to make room for the eye icon so text doesn't overlap
          className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl py-4 pl-12 ${isPasswordType ? 'pr-12' : 'pr-4'} text-zinc-900 font-medium focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-sm md:text-base`}
        />
        
        {/* Toggle Button - Only renders if type is password */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const UserRegistration = ({ onBack, onSuccess, onRegisterUser, onNavigateLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [locationStatus, setLocationStatus] = useState("pending");

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Location access granted at registration.");
        setLocationStatus("granted");
      },
      (err) => {
        console.log("❌ Location access denied:", err.message);
        setLocationStatus("denied");
        if (err.code === 1) {
          setError("Please enable location permissions in your browser settings.");
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    handleRequestLocation();
  }, []);

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
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Registration failed:", err);
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(msg);
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
        <>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <User className="text-white" size={32} />
            </div>
            <h3 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your time is
              <br />
              too valuable
              <br />
              to wait.
            </h3>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white font-bold">Booking Confirmed</p>
                <p className="text-zinc-400 text-sm">You are #3 in line</p>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </>
      }
    >
      <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
        
        {/* Location Button */}
        <div 
          onClick={handleRequestLocation}
          className={`group flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${
            locationStatus === "granted" 
            ? "bg-emerald-50 border-emerald-100" 
            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              locationStatus === "granted" ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500"
            }`}>
              <MapPin size={18} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${
                locationStatus === "granted" ? "text-emerald-700" : "text-zinc-500"
              }`}>
                {locationStatus === "granted" ? "Location Verified" : "Enable Location"}
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight">Required for live queue tracking</p>
            </div>
          </div>
          {locationStatus !== "granted" && (
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-white shadow-sm group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              Allow
            </span>
          )}
          {locationStatus === "granted" && <CheckCircle className="text-emerald-500" size={18} />}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2 animate-pulse">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <InputGroup
          icon={User}
          type="text"
          placeholder="enter your full name"
          label="Full Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputGroup
          icon={Mail}
          type="email"
          placeholder="you@gmail.com"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputGroup
          icon={Phone}
          type="tel"
          placeholder="enter your contact no."
          label="Mobile Number"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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

        <ShimmerButton className="w-full py-4 mt-4" disabled={loading}>
          {loading ? "Creating Account..." : "Create Free Account"}
        </ShimmerButton>

        <div className="pt-2 text-center">
            <p className="text-zinc-500 text-sm">
                Already have an account?{" "}
                <button 
                    type="button" 
                    onClick={onNavigateLogin}
                    className="font-bold text-zinc-900 hover:underline hover:text-black transition-colors"
                >
                    Log in here
                </button>
            </p>
        </div>

      </form>
    </AuthLayout>
  );
};

export default UserRegistration;