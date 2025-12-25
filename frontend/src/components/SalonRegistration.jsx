import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
    Store, User, Phone, MapPin, ArrowRight, ChevronLeft, 
    Mail, Lock, Hash, Crosshair, Tag, Loader2 
} from "lucide-react";
// Assuming LocationPicker is in the same directory
import LocationPicker from "./LocationPicker"; 

// --- ANIMATIONS ---
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const BackgroundAurora = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50 dark:bg-black">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-300/10 rounded-full blur-[120px] animate-pulse" />
    </div>
);

// --- PREMIUM INPUT COMPONENT ---
const InputGroup = ({ icon: Icon, type, label, name, value, onChange, required = true, placeholder = " " }) => (
    <motion.div variants={fadeInUp} className="inputBox relative w-full mb-8 group">
        <input
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            required={required}
            placeholder={placeholder}
            className="inputText peer w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 outline-none 
                        focus:border-black dark:focus:border-white transition-all duration-300 text-zinc-900 dark:text-white placeholder-transparent"
        />
        <span className="absolute left-0 top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
                          peer-focus:-top-4 peer-focus:text-black dark:peer-focus:text-white
                          peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-zinc-500">
            {label}
        </span>
        <Icon className="absolute right-2 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />
    </motion.div>
);

const ShimmerButton = ({ children, isLoading, className = "", onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={isLoading}
        className={`relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 ${className}`}
    >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
    </motion.button>
);

const AuthLayout = ({ children, title, subtitle, onBack, illustration }) => (
    <motion.main 
        initial="initial"
        animate="animate"
        className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans"
    >
        <BackgroundAurora />
        
        <button
            onClick={onBack}
            className="absolute top-8 left-8 z-50 flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
            <ChevronLeft size={16} /> Back
        </button>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div 
                variants={staggerContainer}
                className="order-2 lg:order-1 max-h-[90vh] overflow-y-auto pr-2 
                           [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                <motion.div variants={fadeInUp} className="mb-10 mt-6">
                    <h1 className="text-5xl lg:text-6xl font-light uppercase tracking-tighter text-zinc-900 dark:text-white mb-4">
                        {title}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">{subtitle}</p>
                </motion.div>
                {children}
            </motion.div>

            <motion.div variants={fadeInUp} className="hidden lg:block order-1 lg:order-2 sticky top-0">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col justify-center">
                    {illustration}
                </div>
            </motion.div>
        </div>
    </motion.main>
);

/* ----------------------------------------------------------------------
   COMPONENT 1: SALON REGISTRATION (PREMIUM UI + FULL LOGIC)
---------------------------------------------------------------------- */
export const SalonRegistration = ({ onBack, onRegister, onNavigateLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
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
        referralCode: "",
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("Submitting Data with Location:", formData);
        
        // Simulate API call or perform action
        if (onRegister) {
            await onRegister(formData);
        }
        
        // Stop loading (in real app, do this after success/failure)
        setTimeout(() => setIsLoading(false), 1500); 
    };

    return (
        <AuthLayout 
            title="Partner" 
            subtitle="Transform your salon business today."
            onBack={onBack}
            illustration={
                <div className="space-y-6">
                    <div className="size-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                        <Store className="text-white dark:text-black" size={32} />
                    </div>
                    <h3 className="text-3xl font-light italic leading-tight text-zinc-900 dark:text-white">
                        "Since using TrimGo, our revenue increased by 30% in the first month."
                    </h3>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="size-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                        <div>
                            <p className="font-bold text-zinc-900 dark:text-white">Rajesh Kumar</p>
                            <p className="text-xs text-zinc-500">Owner, The Royal Cut</p>
                        </div>
                    </div>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-2 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="md:col-span-2">
                        <InputGroup icon={Store} name="salonName" value={formData.salonName} onChange={handleChange} type="text" label="Salon Name" />
                    </div>
                    
                    <InputGroup icon={User} name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" label="Owner Name" />
                    <InputGroup icon={Phone} name="phone" value={formData.phone} onChange={handleChange} type="tel" label="Mobile" />
                    
                    <div className="md:col-span-2">
                        <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" />
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Password" />
                        <InputGroup icon={MapPin} name="address" value={formData.address} onChange={handleChange} type="text" label="Full Address" />
                    </div>
                </div>

                {/* --- MAP SECTION --- */}
                <motion.div variants={fadeInUp} className="mb-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">📍 Pin Shop Location</label>
                        {formData.latitude && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                Location Locked ✅
                            </span>
                        )}
                    </div>
                    <div className="rounded-2xl overflow-hidden h-72 relative border border-zinc-200 dark:border-zinc-800 z-0">
                        {/* Ensure LocationPicker handles z-index correctly internally if needed */}
                        <LocationPicker onLocationSelect={handleLocationSelect} />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 text-center">Drag the marker to your exact shop location.</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-8">
                    <InputGroup icon={Hash} name="zipCode" value={formData.zipCode} onChange={handleChange} type="text" label="Zip Code" />
                    
                    {/* CUSTOM SELECT DROPDOWN STYLE */}
                    <motion.div variants={fadeInUp} className="relative mb-10 group border-b-2 border-zinc-200 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white transition-all duration-300">
                        <span className="absolute left-0 -top-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Salon Type</span>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            className="w-full bg-transparent py-3 outline-none appearance-none text-zinc-900 dark:text-white font-bold cursor-pointer relative z-10"
                        >
                            <option value="Unisex">Unisex</option>
                            <option value="Men Only">Men Only</option>
                            <option value="Women Only">Women Only</option>
                        </select>
                        <Crosshair className="absolute right-2 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white pointer-events-none" size={18} />
                    </motion.div>
                </div>

                {/* REFERRAL CODE SECTION */}
                <InputGroup icon={Tag} name="referralCode" value={formData.referralCode} onChange={handleChange} type="text" label="Referral Code (Optional)" required={false} />

                <div className="pt-4">
                    <ShimmerButton isLoading={isLoading} className="w-full text-base">
                        Complete Registration <ArrowRight size={18} />
                    </ShimmerButton>
                </div>
            </form>

            <motion.p variants={fadeInUp} className="mt-4 text-center text-zinc-500 text-sm font-medium pb-10">
                Already a partner? <button onClick={onNavigateLogin} className="text-black dark:text-white font-bold hover:underline">Login to Dashboard</button>
            </motion.p>
        </AuthLayout>
    );
};

/* ----------------------------------------------------------------------
   COMPONENT 2: SALON LOGIN (PREMIUM UI)
---------------------------------------------------------------------- */
export const SalonLogin = ({ onBack, onLogin, onNavigateRegister }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({ identifier: "", password: "" });
    
    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setIsLoading(true);
        
        if (onLogin) await onLogin(credentials);
        
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <AuthLayout 
            title="Welcome" 
            subtitle="Manage your salon queue and revenue."
            onBack={onBack}
            illustration={
                <div className="space-y-8 w-full">
                    <div className="p-8 bg-white dark:bg-black rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Today's Revenue</p>
                        <h2 className="text-5xl font-light text-zinc-900 dark:text-white">₹12,450</h2>
                    </div>
                    <div className="p-8 bg-black dark:bg-white rounded-[2.5rem] shadow-2xl">
                        <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Active Queue</p>
                        <h2 className="text-5xl font-light text-white dark:text-black">08 <span className="text-lg">waiting</span></h2>
                    </div>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <InputGroup icon={User} name="identifier" value={credentials.identifier} onChange={handleChange} type="text" label="Login ID (Email/Mobile)" />
                <InputGroup icon={Lock} name="password" value={credentials.password} onChange={handleChange} type="password" label="Password" />
                
                <ShimmerButton isLoading={isLoading} className="w-full mt-10 text-base">
                    Access Dashboard <ArrowRight size={18} />
                </ShimmerButton>
            </form>
            
            <motion.p variants={fadeInUp} className="mt-8 text-center text-zinc-500 text-sm font-medium">
                New to TrimGo? <button onClick={onNavigateRegister} className="text-black dark:text-white font-bold hover:underline">Register Salon</button>
            </motion.p>
        </AuthLayout>
    );
};

export default SalonRegistration;