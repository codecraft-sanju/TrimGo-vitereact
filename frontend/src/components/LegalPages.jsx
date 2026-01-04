import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, RefreshCcw, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BackgroundAurora, NoiseOverlay } from "./SharedUI"; 
import Footer from "./Footer"; 

// --- CONTENT DATA ---
const legalContent = {
  privacy: {
    title: "Privacy Policy",
    icon: Lock,
    lastUpdated: "January 4, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        text: "We collect information you provide directly to us, such as when you create an account, update your profile, or request customer support. This may include your name, email, phone number, and profile photo. We also automatically collect location data to show you nearby salons (TrimGo Geolocation Services)."
      },
      {
        heading: "2. How We Use Your Data",
        text: "Your data powers the queue management engine. We use it to: (a) Provide, maintain, and improve our services; (b) Process transactions and send related information; (c) Send you technical notices, updates, and support messages."
      },
      {
        heading: "3. Location Information",
        text: "When you launch TrimGo, we request access to your location to find the nearest salons. This data is processed in real-time and is not stored permanently on our servers purely for tracking purposes."
      },
      {
        heading: "4. Data Security",
        text: "We implement industry-standard security measures to protect your personal information. However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%."
      }
    ]
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    lastUpdated: "January 1, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        text: "By accessing or using TrimGo, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service."
      },
      {
        heading: "2. Queue & Booking Rules",
        text: "TrimGo provides estimated wait times based on algorithms. Actual wait times may vary. Salons reserve the right to cancel requests if you are not physically present when your turn arrives."
      },
      {
        heading: "3. User Conduct",
        text: "You agree not to misuse the platform by making fake bookings, spamming the queue system, or harassing salon staff. Violation of this will result in a permanent ban."
      },
      {
        heading: "4. Liability",
        text: "TrimGo is an intermediary platform. We are not responsible for the quality of service provided by the salons or any damages resulting from salon visits."
      }
    ]
  },
  refund: {
    title: "Refund & Cancellation",
    icon: RefreshCcw,
    lastUpdated: "December 20, 2025",
    sections: [
      {
        heading: "1. Cancellation Policy",
        text: "You can cancel your spot in the queue at any time before your service begins without any penalty on the Free Tier. Frequent cancellations may affect your trust score."
      },
      {
        heading: "2. Refunds",
        text: "Since TrimGo payments are often settled directly at the salon, refunds for services are subject to the individual salon's policy. For in-app roadmap payments (Premium features), contact support within 48 hours for resolution."
      },
      {
        heading: "3. No-Show Policy",
        text: "If you do not arrive by the time your turn is called, your ticket will be marked as 'No-Show'. Three consecutive No-Shows will lead to a temporary suspension of your account."
      }
    ]
  }
};

const LegalLayout = ({ type }) => {
  const navigate = useNavigate();
  const data = legalContent[type];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  if (!data) return null;

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans relative overflow-x-hidden selection:bg-zinc-900 selection:text-white">
      <BackgroundAurora />
      <NoiseOverlay />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="font-black text-lg tracking-tight text-zinc-900">TrimGo Legal</div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center md:text-left"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white mb-6 shadow-xl shadow-zinc-900/20">
              <Icon size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-4 tracking-tight">
              {data.title}
            </h1>
            <p className="text-zinc-500 font-medium">
              Last updated: <span className="text-zinc-900 font-bold">{data.lastUpdated}</span>
            </p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation (Desktop) */}
            <div className="hidden md:block col-span-4 relative">
              <div className="sticky top-32 space-y-2">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Table of Contents</p>
                {data.sections.map((section, idx) => (
                  <a 
                    key={idx} 
                    href={`#sec-${idx}`}
                    className="block text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors py-1"
                  >
                    {section.heading}
                  </a>
                ))}
                
                <div className="h-px bg-zinc-200 my-6"></div>
                
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Other Pages</p>
                <button onClick={() => navigate("/legal/privacy")} className={`block text-sm font-bold py-1 ${type === 'privacy' ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'}`}>Privacy Policy</button>
                <button onClick={() => navigate("/legal/terms")} className={`block text-sm font-bold py-1 ${type === 'terms' ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'}`}>Terms of Service</button>
                <button onClick={() => navigate("/legal/refund")} className={`block text-sm font-bold py-1 ${type === 'refund' ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'}`}>Refund Policy</button>
              </div>
            </div>

            {/* Main Text Content */}
            <div className="col-span-1 md:col-span-8 space-y-12">
              {data.sections.map((section, idx) => (
                <motion.section 
                  key={idx}
                  id={`sec-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">{section.heading}</h2>
                  <p className="text-zinc-600 leading-relaxed text-base">
                    {section.text}
                  </p>
                </motion.section>
              ))}

              <div className="mt-16 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <h3 className="font-bold text-zinc-900 mb-2">Have questions?</h3>
                <p className="text-sm text-zinc-500 mb-4">If you have any questions about this policy, please contact us.</p>
                <a href="mailto:support@trimgo.com" className="text-sm font-bold text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-900 underline-offset-4 transition-all">
                  support@trimgo.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Reusing your existing footer but passing dummy function or creating a wrapper */}
      <Footer onNavigateAdmin={() => navigate("/admin/login")} />
    </div>
  );
};

export default LegalLayout;