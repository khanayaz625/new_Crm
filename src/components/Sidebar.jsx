import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  LogOut, 
  PhoneCall, 
  Briefcase,
  Menu,
  X,
  MessageSquarePlus
} from 'lucide-react';

const Sidebar = ({ user, isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[100] p-2.5 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-600/30 active:scale-90 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={`w-64 h-screen bg-white border-r border-slate-100 flex flex-col p-4 fixed left-0 top-0 z-[90] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl shadow-slate-200/50`}>
        <div className="flex items-center gap-3 px-4 py-8 mb-8 border-b border-slate-50">
          <div className="w-full h-14 flex items-center justify-center bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-inner">
            <span className="text-xl font-black text-slate-800 tracking-tight">Next Lead</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink to="/dashboard" end onClick={() => setIsOpen(false)} className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/dashboard/leads" onClick={() => setIsOpen(false)} className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Manage Leads</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/dashboard/team" onClick={() => setIsOpen(false)} className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCircle size={20} />
              <span>Team Members</span>
            </NavLink>
          )}

          <NavLink to="/dashboard/calls" onClick={() => setIsOpen(false)} className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <PhoneCall size={20} />
            <span>Call Logs</span>
          </NavLink>

          <NavLink to="/dashboard/requests" onClick={() => setIsOpen(false)} className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <MessageSquarePlus size={20} />
            <span>Data Requests</span>
          </NavLink>
        </nav>

        <div className="pt-6 border-t border-slate-50">
          <div className="px-4 py-4 mb-4 flex items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-50">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center text-sm font-black uppercase shadow-lg shadow-green-600/20">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user?.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
