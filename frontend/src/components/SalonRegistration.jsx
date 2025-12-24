import React, { useState } from "react";
import { Store, User, Phone, MapPin, ArrowRight, ChevronLeft, Mail, Lock, Hash, Crosshair, Tag } from "lucide-react"; // Tag icon added
// Assuming LocationPicker is in the same directory
import LocationPicker from "./LocationPicker"; 

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
        <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

const ShimmerButton = ({ children, onClick, className = "", disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 hover:shadow-2xl hover:shadow-zinc-900/30 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-3.5">
        {children}
      </span>
    </button>
  );
};

const InputGroup = ({ icon: Icon, type, placeholder, label, name, value, onChange }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none"
        size={20}
      />
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        // UPDATED: Added text-base to prevent iOS zoom, responsive padding
        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 sm:py-4 pl-12 pr-4 text-base text-zinc-900 font-medium focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
      />
    </div>
  </div>
);

const AuthLayout = ({ children, title, subtitle, onBack, illustration }) => (
  <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-3 sm:p-4 md:p-6 relative font-sans overflow-x-hidden">
    <BackgroundAurora />
    <NoiseOverlay />

    <button
      onClick={onBack}
      className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition z-50 font-bold bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 text-sm md:text-base"
    >
      <ChevronLeft size={18} className="md:w-5 md:h-5" /> Home
    </button>

    <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60 mt-12 md:mt-0">
      
      {/* CHANGES MADE HERE: Scrollbar hiding logic */}
      <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-start h-auto md:h-[90vh] md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mb-6 md:mb-8 mt-2">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-2 sm:mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 font-medium">{subtitle}</p>
        </div>
        {children}
      </div>

      <div className="hidden md:flex w-1/2 bg-zinc-900 relative p-12 flex-col justify-between overflow-hidden h-[90vh]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        {illustration}
      </div>
    </div>
  </div>
);

/* ----------------------------------------------------------------------
   COMPONENT 1: SALON REGISTRATION (UPDATED WITH REFERRAL CODE)
---------------------------------------------------------------------- */
export const SalonRegistration = ({ onBack, onRegister, onNavigateLogin }) => {
  const [formData, setFormData] = useState({
    salonName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    password: "",
    type: "Unisex",
    latitude: "",
    longitude: "",
    referralCode: "", // NEW FIELD ADDED
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Data with Location:", formData);
    if (onRegister) onRegister(formData);
  };

  return (
    <AuthLayout
      title="Partner With Us"
      subtitle="Transform your salon business today."
      onBack={onBack}
      illustration={
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/90 z-0"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <Store className="text-white" size={32} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
              "Since using TrimGo, our revenue increased by 30% in the first month."
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex-shrink-0"></div>
              <div>
                <p className="text-white font-bold text-sm">Rajesh Kumar</p>
                <p className="text-zinc-500 text-xs">Owner, The Royal Cut</p>
              </div>
            </div>
          </div>
        </>
      }
    >
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4" onSubmit={handleSubmit}>
        <div className="col-span-1 md:col-span-2">
          <InputGroup icon={Store} name="salonName" value={formData.salonName} onChange={handleChange} type="text" placeholder="Urban Cut Pro" label="Salon Name" />
        </div>
        
        {/* On mobile these stack (col-span-1), on desktop they share the row */}
        <div className="col-span-1">
            <InputGroup icon={User} name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" placeholder="Owner Name" label="Contact Person" />
        </div>
        <div className="col-span-1">
            <InputGroup icon={Phone} name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="9876543210" label="Mobile" />
        </div>
        
        <div className="col-span-1 md:col-span-2">
            <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" placeholder="salon@business.com" label="Email Address" />
        </div>
        <div className="col-span-1 md:col-span-2">
            <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" label="Password" />
        </div>

        <div className="col-span-1 md:col-span-2">
           <InputGroup icon={MapPin} name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Plot No 4, Shastri Nagar" label="Full Address" />
        </div>

        {/* --- MAP SECTION START --- */}
        <div className="col-span-1 md:col-span-2 space-y-1.5 mt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    📍 Pin Shop Location
                </label>
                {formData.latitude && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        Location Locked ✅
                    </span>
                )}
            </div>
            
            {/* Map Component Container */}
            <div className="rounded-lg overflow-hidden border border-zinc-200 w-full h-80 sm:h-72 relative z-0">
                <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>
            
            <p className="text-xs text-zinc-400 mt-2 ml-1">
                Drag the pin to your shop's location.
            </p>
        </div>
        {/* --- MAP SECTION END --- */}
        
        <div className="col-span-1">
             <InputGroup icon={Hash} name="zipCode" value={formData.zipCode} onChange={handleChange} type="text" placeholder="342003" label="Zip Code" />
        </div>

        <div className="col-span-1 space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Salon Type</label>
          <div className="relative group">
             <Crosshair className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none" size={20} />
             <select 
               name="type"
               value={formData.type} 
               onChange={handleChange}
               className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 sm:py-4 pl-12 pr-4 text-base text-zinc-900 font-medium focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-900 transition-all appearance-none relative z-0 cursor-pointer"
             >
               <option value="Unisex">Unisex</option>
               <option value="Men Only">Men Only</option>
               <option value="Women Only">Women Only</option>
             </select>
          </div>
        </div>

        {/* --- NEW REFERRAL CODE SECTION --- */}
        <div className="col-span-1 md:col-span-2 pt-2">
             <InputGroup 
                icon={Tag} 
                name="referralCode" 
                value={formData.referralCode} 
                onChange={handleChange} 
                type="text" 
                placeholder="Ex: SAN458 (Optional)" 
                label="Have a Referral Code?" 
             />
             <p className="text-[10px] text-zinc-400 ml-1 mt-1">
                Enter Agent Code if someone referred you.
             </p>
        </div>

        <div className="col-span-1 md:col-span-2 pt-4">
          <ShimmerButton className="w-full py-4 text-base">
            Complete Registration <ArrowRight size={18} />
          </ShimmerButton>
        </div>
      </form>

      <div className="mt-6 text-center pb-8">
        <p className="text-sm sm:text-base text-zinc-500 font-medium">
          Already a partner?{" "}
          <button onClick={onNavigateLogin} className="text-zinc-900 font-bold hover:underline focus:outline-none">
            Login to Dashboard
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

/* ----------------------------------------------------------------------
   COMPONENT 2: SALON LOGIN (No changes needed here usually)
---------------------------------------------------------------------- */
export const SalonLogin = ({ onBack, onLogin, onNavigateRegister }) => {
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); if (onLogin) onLogin(credentials); };

  return (
    <AuthLayout
      title="Salon Partner Login"
      subtitle="Manage your queue, revenue, and staff."
      onBack={onBack}
      illustration={
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black z-0"></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mb-6 transform hover:scale-105 transition-transform duration-500">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60 text-sm font-bold uppercase">Today's Revenue</span>
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">+12%</span>
                </div>
                <div className="text-4xl font-black text-white">₹12,450</div>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 transform hover:scale-105 transition-transform duration-500 delay-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60 text-sm font-bold uppercase">Active Queue</span>
                    <span className="text-white text-xs font-bold">Live</span>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-3xl font-black text-white">8</div>
                     <span className="text-white/60 text-sm">Customers waiting</span>
                </div>
             </div>
          </div>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputGroup icon={User} name="identifier" value={credentials.identifier} onChange={handleChange} type="text" placeholder="Email or Mobile Number" label="Login ID" />
        <InputGroup icon={Lock} name="password" value={credentials.password} onChange={handleChange} type="password" placeholder="••••••••" label="Password" />
        <div className="pt-4">
          <ShimmerButton className="w-full py-4 text-base">Access Dashboard <ArrowRight size={18} /></ShimmerButton>
        </div>
      </form>
      <div className="mt-8 text-center pb-8">
        <p className="text-sm sm:text-base text-zinc-500 font-medium">New to TrimGo? <button onClick={onNavigateRegister} className="text-zinc-900 font-bold hover:underline focus:outline-none">Register your Salon</button></p>
      </div>
    </AuthLayout>
  );
};

export default SalonRegistration;












// import React, { useState, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//     Store, User, Phone, MapPin, ArrowRight, ChevronLeft, 
//     Mail, Lock, Hash, Crosshair, Tag, Loader2 
// } from "lucide-react";
// import LocationPicker from "./LocationPicker"; 

// // --- ANIMATIONS ---
// const fadeInUp = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } }
// };

// const staggerContainer = {
//     animate: { transition: { staggerChildren: 0.1 } }
// };

// const BackgroundAurora = () => (
//     <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50 dark:bg-black">
//         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/10 rounded-full blur-[120px] animate-pulse" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-300/10 rounded-full blur-[120px] animate-pulse" />
//     </div>
// );

// // --- PREMIUM INPUT COMPONENT ---
// const InputGroup = ({ icon: Icon, type, label, name, value, onChange, required = true }) => (
//     <motion.div variants={fadeInUp} className="inputBox relative w-full mb-10 group">
//         <input
//             name={name}
//             value={value}
//             onChange={onChange}
//             type={type}
//             required={required}
//             placeholder=" " 
//             className="inputText peer w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 outline-none 
//                        focus:border-black dark:focus:border-white transition-all duration-300 text-zinc-900 dark:text-white"
//         />
//         <span className="absolute left-0 top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
//                          peer-focus:-top-4 peer-focus:text-black dark:peer-focus:text-white
//                          peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-zinc-500">
//             {label}
//         </span>
//         <Icon className="absolute right-2 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />
//     </motion.div>
// );

// const ShimmerButton = ({ children, isLoading, className = "", onClick }) => (
//     <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={onClick}
//         disabled={isLoading}
//         className={`relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 ${className}`}
//     >
//         {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
//     </motion.button>
// );

// const AuthLayout = ({ children, title, subtitle, onBack, illustration }) => (
//     <motion.main 
//         initial="initial"
//         animate="animate"
//         className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4 relative overflow-hidden"
//     >
//         <BackgroundAurora />
        
//         <button
//             onClick={onBack}
//             className="absolute top-8 left-8 z-50 flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
//         >
//             <ChevronLeft size={16} /> Back
//         </button>

//         <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
//             <motion.div 
//                 variants={staggerContainer}
//                 className="order-2 lg:order-1 max-h-[85vh] overflow-y-auto pr-2 
//                            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
//             >
//                 <motion.div variants={fadeInUp} className="mb-10 mt-6">
//                     <h1 className="text-5xl lg:text-6xl font-light uppercase tracking-tighter text-zinc-900 dark:text-white mb-4">
//                         {title}
//                     </h1>
//                     <p className="text-zinc-500 dark:text-zinc-400 font-medium">{subtitle}</p>
//                 </motion.div>
//                 {children}
//             </motion.div>

//             <motion.div variants={fadeInUp} className="hidden lg:block order-1 lg:order-2 sticky top-0">
//                 <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col justify-center">
//                     {illustration}
//                 </div>
//             </motion.div>
//         </div>
//     </motion.main>
// );

// /* --- SALON REGISTRATION --- */
// export const SalonRegistration = ({ onBack, onRegister, onNavigateLogin }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         salonName: "",
//         ownerName: "",
//         email: "",
//         phone: "",
//         address: "",
//         zipCode: "",
//         password: "",
//         type: "Unisex",
//         latitude: "",
//         longitude: "",
//         referralCode: "",
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     // --- REVERTED TO ORIGINAL LOGIC ---
//     const handleLocationSelect = (location) => {
//         setFormData((prev) => ({
//             ...prev,
//             latitude: location.lat,
//             longitude: location.lng
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         console.log("Submitting Data with Location:", formData);
//         if (onRegister) {
//             await onRegister(formData);
//         }
//         setIsLoading(false);
//     };

//     return (
//         <AuthLayout 
//             title="Partner" 
//             subtitle="Transform your salon business today."
//             onBack={onBack}
//             illustration={
//                 <div className="space-y-6">
//                     <div className="size-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
//                         <Store className="text-white dark:text-black" size={32} />
//                     </div>
//                     <h3 className="text-3xl font-light italic leading-tight text-zinc-900 dark:text-white">
//                         "Since using TrimGo, our revenue increased by 30% in the first month."
//                     </h3>
//                     <div className="flex items-center gap-4 pt-4">
//                         <div className="size-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
//                         <div>
//                             <p className="font-bold text-zinc-900 dark:text-white">Rajesh Kumar</p>
//                             <p className="text-xs text-zinc-500">Owner, The Royal Cut</p>
//                         </div>
//                     </div>
//                 </div>
//             }
//         >
//             <form onSubmit={handleSubmit} className="space-y-4 pb-10">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
//                     <div className="md:col-span-2">
//                         <InputGroup icon={Store} name="salonName" value={formData.salonName} onChange={handleChange} type="text" label="Salon Name" />
//                     </div>
//                     <InputGroup icon={User} name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" label="Owner Name" />
//                     <InputGroup icon={Phone} name="phone" value={formData.phone} onChange={handleChange} type="tel" label="Mobile" />
                    
//                     <div className="md:col-span-2">
//                         <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" />
//                         <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Password" />
//                         <InputGroup icon={MapPin} name="address" value={formData.address} onChange={handleChange} type="text" label="Full Address" />
//                     </div>
//                 </div>

//                 {/* --- ORIGINAL LOCATION PICKER FUNCTIONALITY --- */}
//                 <motion.div variants={fadeInUp} className="mb-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
//                     <div className="flex justify-between items-center mb-4">
//                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">📍 Pin Shop Location</label>
//                         {formData.latitude && (
//                             <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
//                                 Location Locked ✅
//                             </span>
//                         )}
//                     </div>
//                     <div className="rounded-2xl overflow-hidden h-72 relative border border-zinc-200 dark:border-zinc-800">
//                         <LocationPicker onLocationSelect={handleLocationSelect} />
//                     </div>
//                 </motion.div>

//                 <div className="grid grid-cols-2 gap-8">
//                     <InputGroup icon={Hash} name="zipCode" value={formData.zipCode} onChange={handleChange} type="text" label="Zip Code" />
//                     <motion.div variants={fadeInUp} className="relative mb-10 group border-b-2 border-zinc-200 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white transition-all duration-300">
//                         <span className="absolute left-0 -top-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Salon Type</span>
//                         <select 
//                             name="type" 
//                             value={formData.type} 
//                             onChange={handleChange} 
//                             className="w-full bg-transparent py-3 outline-none appearance-none text-zinc-900 dark:text-white font-bold cursor-pointer"
//                         >
//                             <option value="Unisex">Unisex</option>
//                             <option value="Men Only">Men Only</option>
//                             <option value="Women Only">Women Only</option>
//                         </select>
//                         <Crosshair className="absolute right-2 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white" size={18} />
//                     </motion.div>
//                 </div>

//                 <InputGroup icon={Tag} name="referralCode" value={formData.referralCode} onChange={handleChange} type="text" label="Referral Code (Optional)" required={false} />

//                 <ShimmerButton isLoading={isLoading} className="w-full mt-6">
//                     Complete Registration <ArrowRight size={18} />
//                 </ShimmerButton>
//             </form>

//             <motion.p variants={fadeInUp} className="mt-8 text-center text-zinc-500 text-sm font-medium pb-10">
//                 Already a partner? <button onClick={onNavigateLogin} className="text-black dark:text-white font-bold hover:underline">Login to Dashboard</button>
//             </motion.p>
//         </AuthLayout>
//     );
// };

// /* --- SALON LOGIN --- */
// export const SalonLogin = ({ onBack, onLogin, onNavigateRegister }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [credentials, setCredentials] = useState({ identifier: "", password: "" });
//     const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });
    
//     const handleSubmit = async (e) => { 
//         e.preventDefault(); 
//         setIsLoading(true);
//         if (onLogin) await onLogin(credentials);
//         setIsLoading(false);
//     };

//     return (
//         <AuthLayout 
//             title="Welcome" 
//             subtitle="Manage your salon queue and revenue."
//             onBack={onBack}
//             illustration={
//                 <div className="space-y-8 w-full">
//                     <div className="p-8 bg-white dark:bg-black rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800">
//                         <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Today's Revenue</p>
//                         <h2 className="text-5xl font-light text-zinc-900 dark:text-white">₹12,450</h2>
//                     </div>
//                     <div className="p-8 bg-black dark:bg-white rounded-[2.5rem] shadow-2xl">
//                         <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Active Queue</p>
//                         <h2 className="text-5xl font-light text-white dark:text-black">08 <span className="text-lg">waiting</span></h2>
//                     </div>
//                 </div>
//             }
//         >
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <InputGroup icon={User} name="identifier" value={credentials.identifier} onChange={handleChange} type="text" label="Login ID" />
//                 <InputGroup icon={Lock} name="password" value={credentials.password} onChange={handleChange} type="password" label="Password" />
                
//                 <ShimmerButton isLoading={isLoading} className="w-full mt-10">
//                     Access Dashboard <ArrowRight size={18} />
//                 </ShimmerButton>
//             </form>
            
//             <motion.p variants={fadeInUp} className="mt-8 text-center text-zinc-500 text-sm font-medium">
//                 New to TrimGo? <button onClick={onNavigateRegister} className="text-black dark:text-white font-bold hover:underline">Register Salon</button>
//             </motion.p>
//         </AuthLayout>
//     );
// };

// export default SalonRegistration;