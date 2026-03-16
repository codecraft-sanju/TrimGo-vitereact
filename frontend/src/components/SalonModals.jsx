import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserPlus,
  Camera,
  User,
  LogOut,
  Armchair,
  ChevronRight
} from "lucide-react";

// 1. CUSTOM DROPDOWN COMPONENT (Used inside Assignment Modal)
export const CustomDropdown = ({ icon: Icon, label, name, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full mb-4 group z-50">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-3.5 cursor-pointer flex justify-between items-center hover:border-emerald-500/50 transition-colors"
      >
        <span className={`font-medium ${value ? 'text-white' : 'text-zinc-500'}`}>
          {value || `Select ${label}`}
        </span>
        <Icon
          size={18}
          className={`text-zinc-500 transition-transform duration-300 group-hover:text-emerald-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full w-full z-[60] bg-zinc-900 border border-white/10 rounded-xl shadow-xl mt-2 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors border-b border-white/5 last:border-0 ${value === opt ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. WALK-IN MODAL
export const WalkInModal = ({ isOpen, onClose, services, onConfirm }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);

  if (!isOpen) return null;

  const toggleService = (service) => {
    const exists = selectedServices.find(s => s.name === service.name);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.name !== service.name));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return alert("Customer Name is required");
    if (selectedServices.length === 0) return alert("Select at least one service");

    onConfirm({ name, mobile, services: selectedServices });

    setName("");
    setMobile("");
    setSelectedServices([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="text-emerald-400" /> Add Walk-in Client
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Mobile (Optional)</label>
            <input
              type="number"
              placeholder="e.g. 9876543210"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Services</label>
            <div className="max-h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-zinc-950 p-2 space-y-2">
              {services.length > 0 ? services.map((s, i) => {
                const isSelected = selectedServices.some(sel => sel.name === s.name);
                return (
                  <div
                    key={i}
                    onClick={() => toggleService(s)}
                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'border-white/5 text-zinc-400 hover:bg-white/5'}`}
                  >
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs opacity-70">₹{s.price}</span>
                  </div>
                );
              }) : <p className="text-zinc-600 text-xs p-2 text-center">No services available. Add in settings.</p>}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors mt-2 active:scale-95 transform"
          >
            Add to Queue
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. PROFILE MODAL
export const ProfileModal = ({ isOpen, onClose, salon, profileImage, onImageUpload, onLogout }) => {
  const fileInputRef = useRef(null);
  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageUpload(imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-800 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 relative">
          <div className="relative -mt-16 mb-4 flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className="w-32 h-32 rounded-full border-[6px] border-zinc-900 overflow-hidden shadow-xl bg-zinc-800">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full border-[6px] border-transparent flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all">
                <Camera size={24} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="text-center space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">{salon?.salonName || "TrimGo Salon"}</h2>
            <p className="text-emerald-400 font-medium">@{salon?.ownerName?.replace(/\s/g, '').toLowerCase() || "owner"}</p>

            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Status</span>
                <p className="text-white font-bold flex items-center gap-1 justify-center mt-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</p>
              </div>
              <div className="w-px h-10 bg-white/5"></div>
              <div className="text-center">
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Role</span>
                <p className="text-white font-bold mt-1">Partner</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onLogout}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 4. ASSIGNMENT MODAL
export const AssignmentModal = ({ isOpen, onClose, customer, availableChairs, staffList, onConfirm }) => {
  const [selectedChair, setSelectedChair] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  if (!isOpen || !customer) return null;

  const handleSubmit = () => {
    if (selectedChair && selectedStaff) {
      onConfirm(customer, Number(selectedChair), selectedStaff);
      onClose();
    } else {
      alert("Please select both a Chair and a Staff member.");
    }
  };

  const customerName = customer.userId?.name || customer.guestName || "Walk-in Customer";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Start Service</h3>
            <p className="text-zinc-400 text-sm">For <span className="text-white font-medium">{customerName}</span></p>
          </div>
          <button onClick={onClose}><X size={20} className="text-zinc-500" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Chair</label>
            <div className="grid grid-cols-2 gap-2">
              {availableChairs.length > 0 ? availableChairs.map(chair => (
                <div
                  key={chair.id}
                  onClick={() => setSelectedChair(chair.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${selectedChair === chair.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'}`}
                >
                  <Armchair size={16} />
                  <span className="text-sm font-bold">{chair.name}</span>
                </div>
              )) : <div className="text-red-400 text-xs col-span-2">No chairs available</div>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Assign Staff</label>
            <CustomDropdown
              icon={ChevronRight}
              name="staff"
              label="Staff Member"
              value={selectedStaff}
              options={staffList.map(s => s.name)}
              onChange={(e) => setSelectedStaff(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedChair || !selectedStaff}
            className="w-full py-3.5 mt-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-white transition-colors active:scale-95"
          >
            Start Service
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. EXTEND TIME MODAL
export const ExtendTimeModal = ({ isOpen, onClose, customer, onConfirm }) => {
  const [minutes, setMinutes] = useState(15);
  
  if (!isOpen || !customer) return null;
  const customerName = customer.userId?.name || customer.guestName || "Customer";

  const handleSubmit = () => {
    if (minutes > 0) {
      onConfirm(minutes);
      setMinutes(15); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Extend Time</h3>
            <p className="text-zinc-400 text-sm">For <span className="text-white font-medium">{customerName}</span></p>
          </div>
          <button onClick={onClose}><X size={20} className="text-zinc-500 hover:text-white" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Extra Minutes Needed</label>
            <div className="flex gap-2 mb-4">
              {[5, 10, 15, 30].map(m => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${minutes === m ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-zinc-950 text-zinc-400 border-white/10 hover:border-white/20'}`}
                >
                  +{m}m
                </button>
              ))}
            </div>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-center font-bold focus:border-blue-500 outline-none"
              placeholder="Or enter custom minutes"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors active:scale-95"
          >
            Confirm Extension
          </button>
        </div>
      </div>
    </div>
  );
};

// 6. ADD EXTRA SERVICE MODAL
export const AddExtraServiceModal = ({ isOpen, onClose, services, customer, onConfirm }) => {
  const [selectedServices, setSelectedServices] = useState([]);

  if (!isOpen || !customer) return null;
  const customerName = customer.userId?.name || customer.guestName || "Customer";

  const toggleService = (service) => {
    const exists = selectedServices.find(s => s.name === service.name);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.name !== service.name));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one extra service.");
      return;
    }
    onConfirm(selectedServices);
    setSelectedServices([]); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Add Extra Service</h3>
            <p className="text-zinc-400 text-sm">For <span className="text-white font-medium">{customerName}</span></p>
          </div>
          <button onClick={onClose}><X size={20} className="text-zinc-500 hover:text-white" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Additional Services</label>
            <div className="max-h-56 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-zinc-950 p-2 space-y-2">
              {services.length > 0 ? services.map((s, i) => {
                const isSelected = selectedServices.some(sel => sel.name === s.name);
                return (
                  <div
                    key={i}
                    onClick={() => toggleService(s)}
                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'bg-purple-500/20 border-purple-500 text-white' : 'border-white/5 text-zinc-400 hover:bg-white/5'}`}
                  >
                    <div>
                      <span className="text-sm font-medium block">{s.name}</span>
                      <span className="text-[10px] text-zinc-500">{s.time} mins</span>
                    </div>
                    <span className="text-xs font-bold">₹{s.price}</span>
                  </div>
                );
              }) : <p className="text-zinc-600 text-xs p-2 text-center">No services available.</p>}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-400 transition-colors mt-2 active:scale-95"
          >
            Add to Current Ticket
          </button>
        </div>
      </div>
    </div>
  );
};