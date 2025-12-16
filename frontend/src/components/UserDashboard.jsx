"use client";
import React, { useState, useMemo } from "react";
import {
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Star,
  Bell,
  Ticket,
  X,
  Sparkles,
  Filter,
  Search,
  Check,
  ShoppingBag,
  Scissors
} from "lucide-react";

// Imports
import MapSalon from "./MapSalon";
import { BackgroundAurora, NoiseOverlay, Logo } from "./SharedUI";

/* ---------------------------------
   CONSTANTS: SERVICE MENU DATA
---------------------------------- */
// In a real app, this would come from the specific Salon object API
const MOCK_SERVICES = [
  { id: 1, name: "Classic Haircut", price: 200, time: 25, category: "Hair" },
  { id: 2, name: "Beard Trim & Shape", price: 100, time: 15, category: "Face" },
  { id: 3, name: "Haircut + Beard Combo", price: 280, time: 35, category: "Combo" },
  { id: 4, name: "Premium Facial", price: 650, time: 45, category: "Face" },
  { id: 5, name: "Head Massage (15 min)", price: 150, time: 15, category: "Relax" },
  { id: 6, name: "Hair Color (Global)", price: 1200, time: 90, category: "Hair" },
];

/* ---------------------------------
   HELPER COMPONENT: AI CONCIERGE
---------------------------------- */

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! Looking for a haircut? I can find the shortest queue for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let response = "I can help with that.";
      if (
        userMsg.toLowerCase().includes("urgent") ||
        userMsg.toLowerCase().includes("fast")
      ) {
        response =
          "I found 'Fade & Blade' nearby with only 5 min waiting. Should I book it?";
      } else if (
        userMsg.toLowerCase().includes("cheap") ||
        userMsg.toLowerCase().includes("price")
      ) {
        response = "Urban Cut Pro offers the best rates starting at ₹150.";
      }
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
          <div className="bg-zinc-900 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <h3 className="text-white font-bold text-sm">TrimGo AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="text-zinc-400 hover:text-white" size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                    m.role === "user"
                      ? "bg-zinc-900 text-white rounded-tr-none"
                      : "bg-white border border-zinc-200 text-zinc-600 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-xs text-zinc-400 ml-2 animate-pulse">
                AI is typing...
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-zinc-100 flex gap-2">
            <input
              className="flex-1 bg-zinc-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-zinc-900 text-white shadow-xl shadow-zinc-900/30 flex items-center justify-center hover:scale-110 transition-transform group"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Sparkles
            size={24}
            className="group-hover:rotate-12 transition-transform"
          />
        )}
      </button>
    </div>
  );
};

/* ---------------------------------
   HELPER COMPONENT: SERVICE MODAL
---------------------------------- */

const ServiceSelectionModal = ({ salon, onClose, onConfirm }) => {
  const [selectedServices, setSelectedServices] = useState([]);

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Calculate totals
  const totalDetails = useMemo(() => {
    return selectedServices.reduce(
      (acc, id) => {
        const service = MOCK_SERVICES.find((s) => s.id === id);
        if (service) {
          acc.price += service.price;
          acc.time += service.time;
        }
        return acc;
      },
      { price: 0, time: 0 }
    );
  }, [selectedServices]);

  const handleConfirm = () => {
    if (selectedServices.length === 0) return;
    const servicesList = MOCK_SERVICES.filter((s) =>
      selectedServices.includes(s.id)
    );
    onConfirm(salon, servicesList, totalDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{salon.name}</h2>
            <p className="text-xs text-zinc-500">Select services to join queue</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-200 transition"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {MOCK_SERVICES.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 bg-white"
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">{service.name}</h4>
                    <p className="text-xs text-zinc-500">{service.time} mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-zinc-900">₹{service.price}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-zinc-100">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total Estimate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900">₹{totalDetails.price}</span>
                <span className="text-sm text-zinc-500 font-medium">for {totalDetails.time} mins</span>
              </div>
            </div>
            <div className="text-right">
                <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">
                    {selectedServices.length} items selected
                </span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedServices.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              selectedServices.length > 0
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:scale-[1.02]"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          >
            <span>Confirm & Join Queue</span>
            <Ticket size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN COMPONENT
---------------------------------- */

const UserDashboard = ({ user, onLogout, salons, onJoinQueue, onProfileClick }) => {
  const [selectedCity] = useState("Jodhpur");
  const [sortBy, setSortBy] = useState("waiting");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  // State for Booking Modal
  const [activeBookingSalon, setActiveBookingSalon] = useState(null);

  const filteredSalons = salons.filter((salon) => {
    if (!salon.verified) return false;

    const matchesSearch =
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || salon.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedSalons = [...filteredSalons].sort((a, b) => {
    if (sortBy === "waiting") return a.waiting - b.waiting;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "distance") {
      const da = parseFloat(a.distance);
      const db = parseFloat(b.distance);
      return da - db;
    }
    return 0;
  });

  // Handler to open modal
  const handleOpenBooking = (salon) => {
    setActiveBookingSalon(salon);
  };

  // Handler to close modal
  const handleCloseBooking = () => {
    setActiveBookingSalon(null);
  };

  // Handler when user confirms services inside modal
  const handleConfirmBooking = (salon, services, totals) => {
    // We pass the salon AND the selected service details to the main handler
    // You can now process 'services' (array) and 'totals' (price/time) in your backend
    onJoinQueue({ 
        ...salon, 
        selectedServices: services,
        totalPrice: totals.price,
        totalServiceTime: totals.time 
    });
    setActiveBookingSalon(null);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans overflow-x-hidden pb-32">
      <BackgroundAurora />
      <NoiseOverlay />

      {/* SERVICE SELECTION MODAL */}
      {activeBookingSalon && (
        <ServiceSelectionModal 
            salon={activeBookingSalon} 
            onClose={handleCloseBooking} 
            onConfirm={handleConfirmBooking} 
        />
      )}

      <header className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />

            <div className="h-6 w-px bg-zinc-200 hidden sm:block"></div>

            <div
              onClick={onProfileClick}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`}
                      alt={user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {user?.name || "Guest"}
                </span>
                <span className="text-[10px] font-medium text-zinc-500">
                  Free Plan
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-xs text-zinc-600">
              <MapPin size={14} />
              <span>{selectedCity}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-zinc-900 text-white hover:scale-105 transition-transform"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-[0.16em]">
                Live Availability
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
                Find a salon near you.
              </h1>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Unisex", "Men Only", "Women Only"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-3 rounded-2xl font-bold whitespace-nowrap border transition-all text-xs md:text-sm ${
                    filterType === type
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <MapSalon salons={filteredSalons} onSelect={(s) => handleOpenBooking(s)} />

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-x-0 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by salon name or area..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider whitespace-nowrap">
                Sort by:
              </span>
              {["waiting", "rating", "distance"].map((criteria) => (
                <button
                  key={criteria}
                  onClick={() => setSortBy(criteria)}
                  className={`text-xs px-3 py-1 rounded-full border ${
                    sortBy === criteria
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-transparent border-zinc-300 text-zinc-500"
                  }`}
                >
                  {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedSalons.map((salon) => (
            <div
              key={salon.id}
              className="group relative rounded-2xl bg-white/80 backdrop-blur-sm border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-sky-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-zinc-900 flex items-center gap-2">
                      {salon.name}
                      <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-[10px] font-semibold text-white uppercase tracking-wide">
                        LIVE
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <MapPin size={14} />
                      <span>
                        {salon.area}, {salon.city} • {salon.distance}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-100 inline-block px-2 py-0.5 rounded-md">
                      {salon.type}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                      <Star
                        className="text-yellow-400 fill-yellow-400"
                        size={14}
                      />
                      {salon.rating.toFixed(1)}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      {salon.reviews}+ ratings
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase text-zinc-500 font-semibold tracking-[0.16em]">
                        Current waiting
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-zinc-900">
                          {salon.waiting}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          people in line
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col border-l border-dashed border-zinc-200 pl-4">
                      <span className="text-[11px] uppercase text-zinc-500 font-semibold tracking-[0.16em]">
                        Estimated time
                      </span>
                      <span className="text-sm font-semibold text-zinc-900">
                        {salon.eta} mins
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>
                        Chairs free: {Math.max(0, 5 - salon.waiting)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      <span>Updated just now</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <Sparkles size={14} />
                    <span>{salon.tag}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                      View details
                    </button>
                    <button
                      onClick={() => handleOpenBooking(salon)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:scale-105 transition-transform flex items-center justify-center gap-1.5"
                    >
                      Join queue
                      <Ticket size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedSalons.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <Filter size={48} className="mx-auto mb-4" />
            <p className="text-xl font-bold">No verified salons found</p>
            <p>Try changing your filters.</p>
          </div>
        )}

        <p className="mt-8 text-[11px] text-zinc-400 text-center">
          This is demo data. In production, these numbers will come live from
          each partner salon’s TrimGo system in real time.
        </p>

        {/* AI CONCIERGE BUTTON */}
        <AIConcierge />
      </main>
    </div>
  );
};

export default UserDashboard;