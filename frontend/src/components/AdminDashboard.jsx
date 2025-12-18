"use client";
import React, { useState, useEffect } from "react";
import {
  ShieldCheck, User, Lock, LayoutDashboard, Store, Users, CreditCard,
  LogOut, Globe2, Bell, DollarSign, Activity, Clock, Download, Zap,
  CheckCircle, AlertTriangle, Star, Ban, Settings, Search, Mail, Phone, Calendar, MapPin
} from "lucide-react";
import api from "../utils/api";
import { io } from "socket.io-client"; // Import Socket.io

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- LEAFLET ICON FIX (Required for React) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src || icon,
    shadowUrl: iconShadow.src || iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- ADMIN LOGIN COMPONENT ---
export const AdminLogin = ({ onBack, onLogin }) => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if(creds.username === "admin" && creds.password === "admin123") {
      onLogin();
    } else {
      alert("Invalid Founder Credentials");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-80"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      
      <div className="relative z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">Founder Access</h2>
          <p className="text-zinc-500 text-sm mt-1">Wolars Infosys Private Limited</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-1 flex items-center">
            <User className="text-zinc-500 ml-3" size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              className="bg-transparent w-full p-3 text-white outline-none placeholder:text-zinc-600"
              value={creds.username}
              onChange={(e) => setCreds({...creds, username: e.target.value})}
            />
          </div>
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-1 flex items-center">
            <Lock className="text-zinc-500 ml-3" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-transparent w-full p-3 text-white outline-none placeholder:text-zinc-600"
              value={creds.password}
              onChange={(e) => setCreds({...creds, password: e.target.value})}
            />
          </div>
          <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition mt-4">
            Enter God Mode
          </button>
        </form>
        
        <button onClick={onBack} className="w-full text-zinc-500 text-xs mt-6 hover:text-white transition">
          Return to Platform
        </button>
      </div>
    </div>
  );
};

// --- NEW COMPONENT: ADMIN MAP VIEW ---
const AdminMap = ({ salons }) => {
    // Default Center (Jodhpur) - Adjust if needed
    const defaultCenter = [26.2389, 73.0243]; 

    return (
        <div className="h-80 w-full rounded-3xl overflow-hidden border border-zinc-800 z-0 relative mb-6">
            <MapContainer 
                center={defaultCenter} 
                zoom={12} 
                scrollWheelZoom={false} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {salons.map((salon) => (
                    salon.latitude && salon.longitude && (
                        <Marker key={salon._id} position={[salon.latitude, salon.longitude]}>
                            <Popup>
                                <div className="text-zinc-900 font-sans p-1">
                                    <h3 className="font-bold text-sm">{salon.salonName}</h3>
                                    <p className="text-xs text-zinc-500">{salon.area}</p>
                                    <div className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${salon.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {salon.verified ? "Verified" : "Pending"}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
            {/* Dark Overlay for Dashboard aesthetic */}
            <div className="absolute inset-0 pointer-events-none border-[6px] border-zinc-900/20 rounded-3xl z-[400]"></div>
        </div>
    );
};

// --- ADMIN DASHBOARD COMPONENT ---

export const AdminDashboard = ({ salons = [], setSalons, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dynamic Data States
  const [stats, setStats] = useState({ users: 0, salons: 0, revenue: 0 });
  const [activityLog, setActivityLog] = useState([]);
  const [userList, setUserList] = useState([]);
  const [localSalons, setLocalSalons] = useState([]); // Use this to manage salons inside dashboard

  const [loading, setLoading] = useState(false);

  // --- 1. SOCKET.IO CONNECTION ---
  useEffect(() => {
    // Connect to Backend Socket
    const socket = io("http://localhost:5000"); 

    // Join Admin Room
    socket.emit("join_room", "admin_room");

    // Listen for Real-Time Updates
    socket.on("admin_stats_update", () => {
        console.log("⚡ Admin Stats Updated via Socket");
        fetchDashboardData(); 
    });

    return () => socket.disconnect();
  }, []);

  // --- 2. INITIAL DATA FETCH ---
  useEffect(() => {
    fetchDashboardData();
    fetchSalons(); 
  }, []);

  // Fetch Users when tab changes
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // --- API CALLS ---

  const fetchDashboardData = async () => {
    try {
        const { data } = await api.get("/admin/dashboard");
        if(data.success) {
            setStats(data.stats);
            setActivityLog(data.activity);
        }
    } catch (error) {
        console.error("Dashboard Fetch Error", error);
    }
  };

  const fetchSalons = async () => {
    try {
        const { data } = await api.get("/salon/all");
        if(data.success) {
            setLocalSalons(data.salons);
            if(setSalons) setSalons(data.salons); 
        }
    } catch (error) {
        console.error("Salons Fetch Error", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auth/all");
      if (data.success) {
        setUserList(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const toggleVerify = async (id, currentStatus) => {
    try {
        const { data } = await api.put(`/admin/verify/${id}`, { verified: !currentStatus });
        if(data.success) {
            setLocalSalons(prev => prev.map(s => s._id === id ? { ...s, verified: !currentStatus } : s));
            alert(data.message);
        }
    } catch (error) {
        alert("Action Failed");
    }
  };

  const deleteSalon = async (id) => {
    if(window.confirm("CONFIRM DELETION: This action cannot be undone.")) {
      try {
        const { data } = await api.delete(`/admin/delete/${id}`);
        if(data.success) {
            setLocalSalons(prev => prev.filter(s => s._id !== id));
            alert(data.message);
        }
      } catch (error) {
        alert("Delete Failed");
      }
    }
  };

  const displayedSalons = localSalons.length > 0 ? localSalons : salons;
  const filteredSalons = displayedSalons.filter(s => s.salonName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500 selection:text-white flex overflow-hidden">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex w-64 border-r border-zinc-800 bg-zinc-900/30 flex-col backdrop-blur-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white mr-3 shadow-[0_0_15px_rgba(79,70,229,0.4)]">W</div>
          <span className="font-bold text-lg tracking-tight">Wolars<span className="text-zinc-500">OS</span></span>
        </div>

        <div className="p-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Main Menu</p>
          {[
            { id: "overview", icon: LayoutDashboard, label: "Command Center" },
            { id: "salons", icon: Store, label: "Partner Management" },
            { id: "users", icon: Users, label: "User Base" },
            { id: "financials", icon: CreditCard, label: "Financials" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold hover:bg-red-500/20 transition">
            <LogOut size={16} /> Exit Founder Mode
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {activeTab === 'overview' ? "Command Center" : activeTab === 'users' ? "User Base" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            {activeTab === 'overview' && <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">Live Socket: Connected</span>}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <Globe2 size={14} /> Global: Jodhpur
            </div>
            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer">
              <Bell size={16} />
            </div>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          
          {/* ---------------- OVERVIEW VIEW (Dynamic Data) ---------------- */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-[slideUp_0.4s_ease-out]">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", val: `₹${stats.revenue?.toLocaleString() || 0}`, change: "Lifetime", icon: DollarSign, color: "text-green-400" },
                  { label: "Total Partners", val: stats.salons || 0, change: "Registered", icon: Store, color: "text-purple-400" },
                  { label: "Total Users", val: stats.users || 0, change: "Registered DB", icon: Users, color: "text-indigo-400" },
                  { label: "Live Queue Activity", val: "Active", change: "Socket On", icon: Activity, color: "text-blue-400", live: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-zinc-800/50 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon size={24} />
                      </div>
                      {stat.live && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{stat.val}</h3>
                    <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                    <span className="absolute bottom-6 right-6 text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{stat.change}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Graph (Still visual only, but represents data) */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-bold text-lg text-white">Projected Growth</h3>
                      <p className="text-zinc-500 text-xs">Visual Representation of Scale</p>
                    </div>
                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition"><Download size={18}/></button>
                  </div>
                  
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[35, 45, 30, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                      <div key={i} className="w-full bg-zinc-800/50 rounded-t-lg relative group hover:bg-indigo-600/50 transition-all duration-300" style={{ height: `${h}%` }}>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Activity Feed (REAL DATA FROM DB) */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col h-[400px]">
                  <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" /> Recent Activity
                  </h3>
                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {activityLog.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center mt-10">No recent activity found.</p>
                    ) : (
                        activityLog.map((log, i) => (
                        <div key={i} className="flex gap-3 relative pl-4 border-l border-zinc-800">
                            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500`}></div>
                            <div>
                            <p className="text-sm text-zinc-300 leading-snug">
                                <span className="font-bold text-white">{log.userId?.name || "User"}</span> joined queue at <span className="text-zinc-100 font-medium">{log.salonId?.salonName || "Salon"}</span>
                            </p>
                            <p className="text-[10px] text-zinc-600 font-mono mt-1">{new Date(log.updatedAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SALONS VIEW (Dynamic with Map) ---------------- */}
          {activeTab === "salons" && (
            <div className="animate-[slideUp_0.4s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Partner Management</h2>
                  <p className="text-zinc-500 text-sm">Geospatial view of all registered partners.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/>
                  <input 
                    type="text" 
                    placeholder="Search salons..." 
                    className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* --- ADDED MAP HERE --- */}
              <AdminMap salons={filteredSalons} />

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden mt-6">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Salon Details</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Revenue</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredSalons.map(salon => (
                      <tr key={salon._id} className="hover:bg-white/[0.02] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white text-xs border border-zinc-700">
                              {salon.salonName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{salon.salonName}</p>
                              <p className="text-xs text-zinc-500">{salon.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {salon.verified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold">
                              <CheckCircle size={12}/> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold">
                              <AlertTriangle size={12}/> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white font-mono">₹{salon.revenue?.toLocaleString() ?? 0}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => toggleVerify(salon._id, salon.verified)} className="text-indigo-400 hover:underline text-xs mr-3">
                            {salon.verified ? "Revoke" : "Verify"}
                          </button>
                          <button onClick={() => deleteSalon(salon._id)} className="text-red-400 hover:underline text-xs">
                            Ban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- USERS VIEW (Real Data) ---------------- */}
          {activeTab === "users" && (
             <div className="animate-[slideUp_0.4s_ease-out]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">User Base</h2>
                    <p className="text-zinc-500 text-sm">Real-time registered users from database.</p>
                  </div>
                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 border border-zinc-700">
                        Total Users: {userList.length}
                     </span>
                  </div>
                </div>

                {loading ? (
                   <div className="flex justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                   </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-400">
                      <thead className="bg-zinc-900 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Contact Info</th>
                          <th className="px-6 py-4">Joined Date</th>
                          <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {userList.length === 0 ? (
                           <tr>
                              <td colSpan="4" className="text-center py-10 text-zinc-600">No users found in database.</td>
                           </tr>
                        ) : (
                          userList.map((user) => (
                            <tr key={user._id} className="hover:bg-white/[0.02] transition">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  <span className="font-bold text-white">{user.name || "Unknown"}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2 text-xs">
                                      <Mail size={12} className="text-zinc-600"/> {user.email}
                                   </div>
                                   <div className="flex items-center gap-2 text-xs">
                                      <Phone size={12} className="text-zinc-600"/> {user.phone}
                                   </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                                <div className="flex items-center gap-2">
                                   <Calendar size={12}/>
                                   {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
          )}

          {/* ---------------- FINANCIALS PLACEHOLDER ---------------- */}
          {activeTab === "financials" && (
             <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-[slideUp_0.4s_ease-out]">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                   <Settings size={40} className="animate-spin-slow"/>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Financial Module</h3>
                <p className="max-w-md text-center">Revenue analytics and payout integrations coming soon.</p>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};