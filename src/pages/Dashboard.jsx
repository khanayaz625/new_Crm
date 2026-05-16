import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Overview from './Overview';
import Leads from './Leads';
import Team from './Team';
import Calls from './Calls';
import DataRequests from './DataRequests';
import { Bell, BellDot, X, Clock } from 'lucide-react';
import API_BASE from '../config';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Cache for performance: avoid re-loading when switching tabs
  const [leadsCache, setLeadsCache] = useState(null);
  const [logsCache, setLogsCache] = useState(null);
  const [statsCache, setStatsCache] = useState(null);
  const [metadataCache, setMetadataCache] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/notifications/${id}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <header className="mb-8 mt-12 lg:mt-0 flex items-center justify-between gap-4 relative">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">Good Day, {user?.name}</h1>
            <p className="text-slate-400 text-xs md:text-sm truncate">Welcome to DigiCoders CRM</p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Notification Bell - High Visibility */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 md:p-3 rounded-2xl transition-all relative group border ${
                  unreadCount > 0 
                  ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                }`}
              >
                {unreadCount > 0 ? (
                  <>
                    <BellDot className="group-hover:rotate-12 transition-transform" size={24} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell size={24} />
                )}
              </button>

              {/* Notification Dropdown - Improved for Mobile */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[280px] md:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[110] animate-in slide-in-from-top-2 duration-200 overflow-hidden ring-1 ring-blue-500/20">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-700 rounded-lg"><X size={16} className="text-slate-500" /></button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">No notifications yet.</div>
                    ) : notifications.map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => markAsRead(n._id)}
                        className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-all ${!n.isRead ? 'bg-blue-600/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-blue-400' : 'text-slate-300'}`}>{n.title}</span>
                          {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-slate-600 mt-2 font-medium">{new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge - Simplified for Mobile */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{user?.role}</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Overview user={user} cache={statsCache} setCache={setStatsCache} />} />
          <Route path="/leads" element={<Leads user={user} cache={leadsCache} setCache={setLeadsCache} metadataCache={metadataCache} setMetadataCache={setMetadataCache} />} />
          <Route path="/team" element={<Team />} />
          <Route path="/calls" element={<Calls user={user} cache={logsCache} setCache={setLogsCache} />} />
          <Route path="/requests" element={<DataRequests user={user} />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
