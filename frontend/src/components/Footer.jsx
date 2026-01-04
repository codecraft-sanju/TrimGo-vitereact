import React from "react";
import { Heart, Globe, Mail, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Added for navigation

const RevealText = ({ text, className }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: -20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5, margin: "0px 0px -50px 0px" }}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} style={{ display: "inline-block" }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const Logo = ({ dark = false }) => (
  <div className="flex items-center gap-2 group cursor-pointer select-none">
    <div
      className={`w-9 h-9 ${dark ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
        } rounded-xl flex items-center justify-center font-bold text-sm shadow-lg group-hover:rotate-12 transition-transform duration-300`}
    >
      TG
    </div>
    <span
      className={`font-bold text-lg tracking-tight ${dark ? "text-white" : "text-zinc-900"
        }`}
    >
      TrimGo
    </span>
  </div>
);

const SocialIcon = ({ icon: Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer text-zinc-600"
  >
    <Icon size={18} />
  </a>
);

const Footer = ({ onNavigateAdmin }) => {
  const navigate = useNavigate(); // Hook initialized
  // Current year automatically fetch karega
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <footer className="bg-white border-t border-zinc-200 pt-20 pb-10 px-6 relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3, margin: "0px 0px -100px 0px" }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
      >
        {/* Brand Section */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
          <Logo />

          <RevealText
            text="TrimGo makes salon visits effortless with smart queue management. Skip the wait—book your spot and arrive exactly when it's your turn."
            className="mt-6 text-zinc-500 max-w-sm leading-relaxed text-sm"
          />

          <div className="flex gap-4 mt-8">
            <SocialIcon icon={Instagram} href="#" />
            <SocialIcon icon={Twitter} href="#" />
            <SocialIcon icon={Linkedin} href="#" />
            <SocialIcon icon={Globe} href="#" />
          </div>
        </motion.div>

        {/* Product Links */}
        <motion.div variants={itemVariants}>
          <h4 className="font-bold text-zinc-900 mb-6">Product</h4>
          <ul className="space-y-4 text-zinc-500 text-sm font-medium">
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              For Users
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              For Salons
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Pricing
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Download App
            </li>
          </ul>
        </motion.div>

        {/* Support & Legal */}
        <motion.div variants={itemVariants}>
          <h4 className="font-bold text-zinc-900 mb-6">Support</h4>
          <ul className="space-y-4 text-zinc-500 text-sm font-medium">
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Help Center
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Partner with us
            </li>
            
            {/* UPDATED LINKS BELOW */}
            <li 
              onClick={() => navigate("/legal/privacy")} 
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </li>
            <li 
              onClick={() => navigate("/legal/terms")} 
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </li>
            <li 
              onClick={() => navigate("/legal/refund")} 
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Refund Policy
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="max-w-7xl mx-auto pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400 gap-4"
      >
        {/* Dynamic Year Here */}
        <p>© {currentYear} TrimGo. All rights reserved.</p>

        <div className="flex flex-col items-center md:items-end">
          <p className="flex items-center gap-1 hover:text-zinc-600 transition-colors cursor-default">
            Made with{" "}
            <Heart
              size={12}
              className="text-red-400 fill-red-400 animate-pulse"
            />{" "}
            in India
          </p>

          {/* Secret Admin Access */}
          <button
            onClick={onNavigateAdmin}
            className="mt-2 text-[10px] uppercase font-bold text-zinc-200 hover:text-zinc-900 transition-colors tracking-wider"
          >
            Founder Login
          </button>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;