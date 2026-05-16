import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  PhoneCall, 
  UserCheck, 
  UserMinus,
  LayoutGrid,
  BarChart3,
  TrendingUp,
  History
} from 'lucide-react';
import API_BASE from '../config';

const Overview = ({ user, cache, setCache }) => {
  const [stats, setStats] = useState(cache || {
    total: 0,
    pending: 0,
    followUp: 0,
    assigned: 0,
    unassigned: 0,
    won: 0,
    called: 0
  });
  const [productivity, setProductivity] = useState([]);
  const [loading, setLoading] = useState(!cache);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchStats();
    if (isAdmin) fetchProductivity();
  }, []);

  const fetchStats = async () => {
    try {
      // Try fetching from the new optimized stats endpoint
      const res = await axios.get(`${API_BASE}/leads/stats`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setStats(res.data);
      setCache(res.data);
    } catch (err) {
      console.warn("Stats API failed, falling back to client-side calculation", err);
      // Fallback: Fetch all leads and calculate stats manually (old way)
      try {
        const res = await axios.get(`${API_BASE}/leads`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const leads = Array.isArray(res.data) ? res.data : (res.data.leads || []);
        
        setStats({
          total: leads.length,
          pending: leads.filter(l => l.status === 'New').length,
          followUp: leads.filter(l => l.status === 'Follow Up').length,
          assigned: leads.filter(l => l.assignedTo).length,
          unassigned: leads.filter(l => !l.assignedTo).length,
          won: leads.filter(l => l.status === 'Won').length,
          called: leads.filter(l => l.assignedTo && l.status !== 'New').length,
        });
      } catch (fallbackErr) {
        console.error("Dashboard fallback failed", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProductivity = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/productivity`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setProductivity(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoxClick = (filterType, value) => {
    navigate('/dashboard/leads', { state: { filterType, value } });
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center">
            <LayoutGrid className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h2>
            <p className="text-slate-500 text-xs font-medium">Real-time performance analytics</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatBox 
          title="Total Leads" 
          value={stats.total} 
          icon={<Users />} 
          color="bg-blue-50 text-blue-600" 
          label="Total Database"
          onClick={() => handleBoxClick('all', '')}
        />
        <StatBox 
          title="Pending" 
          value={stats.pending} 
          icon={<Clock />} 
          color="bg-amber-50 text-amber-600" 
          label="Untouched Leads"
          onClick={() => handleBoxClick('status', 'New')}
        />
        <StatBox 
          title="Follow-ups" 
          value={stats.followUp} 
          icon={<PhoneCall />} 
          color="bg-purple-50 text-purple-600" 
          label="Scheduled Tasks"
          onClick={() => handleBoxClick('status', 'Follow Up')}
        />
        {isAdmin && (
          <>
            <StatBox 
              title="Assigned" 
              value={stats.assigned} 
              icon={<UserCheck />} 
              color="bg-green-50 text-green-600" 
              label="Active Allocation"
              onClick={() => handleBoxClick('assigned', 'assigned')}
            />
            <StatBox 
              title="Unassigned" 
              value={stats.unassigned} 
              icon={<UserMinus />} 
              color="bg-red-50 text-red-600" 
              label="Awaiting Agent"
              onClick={() => handleBoxClick('assigned', 'unassigned')}
            />
          </>
        )}
        <StatBox 
          title="Called" 
          value={stats.called} 
          icon={<PhoneCall />} 
          color="bg-indigo-50 text-indigo-600" 
          label="Interacted"
          onClick={() => handleBoxClick('assigned', 'assigned')}
        />
        <StatBox 
          title="Won Deals" 
          value={stats.won} 
          icon={<CheckCircle2Icon />} 
          color="bg-emerald-50 text-emerald-600" 
          label="Successfully Closed"
          onClick={() => handleBoxClick('status', 'Won')}
        />
      </div>

      {/* Admin Specific: Employee Productivity Section */}
      {isAdmin && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Team Productivity (Today)</h2>
          </div>
          
          <div className="card overflow-hidden !p-0">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50 bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5">Employee</th>
                  <th className="px-8 py-5 text-center">Interactions</th>
                  <th className="px-8 py-5 text-center">Last Activity</th>
                  <th className="px-8 py-5 text-right">Activity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productivity.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-20 text-slate-400 font-medium italic">
                      <History className="mx-auto mb-4 opacity-10" size={48} />
                      No activity recorded for today yet.
                    </td>
                  </tr>
                ) : productivity.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500 uppercase">
                          {(emp.name || 'E').charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                        <span className="text-lg font-black text-blue-600">{emp.followUps}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-bold text-slate-400">
                      {new Date(emp.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ title, value, icon, color, label, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-100 p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-green-600/10 hover:border-green-200 cursor-pointer transition-all group active:scale-[0.98] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-green-50 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl shadow-sm ${color}`}>
            {React.cloneElement(icon, { size: 28 })}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
            <div className="w-8 h-1 bg-slate-100 rounded-full mt-2 group-hover:bg-green-200 transition-colors"></div>
          </div>
        </div>
        <div>
          <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest group-hover:text-green-600 transition-colors">{title}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Overview;
