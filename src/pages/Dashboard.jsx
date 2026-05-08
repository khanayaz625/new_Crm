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

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/notifications', {
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
      await axios.put(`http://localhost:5001/api/notifications/${id}`, {}, {
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
        <header className="mb-8 mt-12 lg:mt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Good Day, {user?.name}</h1>
            <p className="text-slate-400 text-sm">Welcome to DigiCoders CRM Dashboard.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all hover:border-blue-500/50 relative group"
              >
                {unreadCount > 0 ? (
                  <>
                    <BellDot className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell size={24} />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[110] animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={18} className="text-slate-500" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                    ) : notifications.map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => markAsRead(n._id)}
                        className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-all ${!n.isRead ? 'bg-blue-600/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-bold ${!n.isRead ? 'text-blue-400' : 'text-slate-300'}`}>{n.title}</span>
                          <Clock size={10} className="text-slate-600" />
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex-1 md:flex-none">
              <div className="text-left md:text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none">Role</p>
                <p className="text-sm font-semibold text-blue-400">{user?.role?.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Overview user={user} />} />
          <Route path="/leads" element={<Leads user={user} />} />
          <Route path="/team" element={<Team />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/requests" element={<DataRequests user={user} />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
