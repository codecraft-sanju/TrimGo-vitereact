import React from "react";
import { Heart, Globe, Mail, Instagram, Twitter, Linkedin } from "lucide-react";

const Logo = ({ dark = false }) => (
  <div className="flex items-center gap-2 group cursor-pointer select-none">
    <div
      className={`w-9 h-9 ${
        dark ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
      } rounded-xl flex items-center justify-center font-bold text-sm shadow-lg group-hover:rotate-12 transition-transform duration-300`}
    >
      TG
    </div>
    <span
      className={`font-bold text-lg tracking-tight ${
        dark ? "text-white" : "text-zinc-900"
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
  // Current year automatically fetch karega
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-200 pt-20 pb-10 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">
          <Logo />
          <p className="mt-6 text-zinc-500 max-w-sm leading-relaxed text-sm">
            TrimGo makes salon visits effortless with smart queue management.
            Skip the wait—book your spot and arrive exactly when it's your turn.
          </p>

          <div className="flex gap-4 mt-8">
            <SocialIcon icon={Instagram} href="#" />
            <SocialIcon icon={Twitter} href="#" />
            <SocialIcon icon={Linkedin} href="#" />
            <SocialIcon icon={Globe} href="#" />
          </div>
        </div>

        {/* Product Links */}
        <div>
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
        </div>

        {/* Support & Legal */}
        <div>
          <h4 className="font-bold text-zinc-900 mb-6">Support</h4>
          <ul className="space-y-4 text-zinc-500 text-sm font-medium">
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Help Center
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Partner with us
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Privacy Policy
            </li>
            <li className="hover:text-zinc-900 transition-colors cursor-pointer">
              Terms of Service
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400 gap-4">
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
      </div>
    </footer>
  );
};

export default Footer;