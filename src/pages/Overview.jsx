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

const Overview = ({ user }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    followUp: 0,
    assigned: 0,
    unassigned: 0,
    won: 0,
    called: 0
  });
  const [productivity, setProductivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchStats();
    if (isAdmin) fetchProductivity();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leads/stats`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
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
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3 mb-2">
        <LayoutGrid className="text-blue-400" size={24} />
        <h2 className="text-xl font-bold">Dashboard Overview</h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatBox 
          title="Total Data" 
          value={stats.total} 
          icon={<Users />} 
          color="bg-blue-500/10 text-blue-400" 
          label="All leads in system"
          onClick={() => handleBoxClick('all', '')}
        />
        <StatBox 
          title="Pending Leads" 
          value={stats.pending} 
          icon={<Clock />} 
          color="bg-amber-500/10 text-amber-400" 
          label="Leads with 'New' status"
          onClick={() => handleBoxClick('status', 'New')}
        />
        <StatBox 
          title="Total Follow-ups" 
          value={stats.followUp} 
          icon={<PhoneCall />} 
          color="bg-purple-500/10 text-purple-400" 
          label="Scheduled for follow up"
          onClick={() => handleBoxClick('status', 'Follow Up')}
        />
        {isAdmin && (
          <>
            <StatBox 
              title="Assigned Data" 
              value={stats.assigned} 
              icon={<UserCheck />} 
              color="bg-green-500/10 text-green-400" 
              label="Distributed to team"
              onClick={() => handleBoxClick('assigned', 'assigned')}
            />
            <StatBox 
              title="Unassigned Data" 
              value={stats.unassigned} 
              icon={<UserMinus />} 
              color="bg-red-500/10 text-red-400" 
              label="Awaiting assignment"
              onClick={() => handleBoxClick('assigned', 'unassigned')}
            />
          </>
        )}
        <StatBox 
          title="Called Data" 
          value={stats.called} 
          icon={<PhoneCall />} 
          color="bg-indigo-500/10 text-indigo-400" 
          label="Interacted from assigned pool"
          onClick={() => handleBoxClick('assigned', 'assigned')}
        />
        <StatBox 
          title="Won Deals" 
          value={stats.won} 
          icon={<CheckCircle2Icon />} 
          color="bg-emerald-500/10 text-emerald-400" 
          label="Successfully closed"
          onClick={() => handleBoxClick('status', 'Won')}
        />
      </div>

      {/* Admin Specific: Employee Productivity Section */}
      {isAdmin && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold">Team Productivity (Today)</h2>
          </div>
          
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Follow-ups Today</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {productivity.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-500">
                      <History className="mx-auto mb-2 opacity-20" size={32} />
                      No activity recorded for today yet.
                    </td>
                  </tr>
                ) : productivity.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-400">{emp.followUps}</span>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Interactions</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(emp.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
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
      className="card hover:border-blue-500/50 hover:bg-slate-900/80 cursor-pointer transition-all group active:scale-95 shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className="text-3xl font-bold tracking-tight">{value}</span>
      </div>
      <div>
        <h4 className="text-slate-100 font-bold group-hover:text-blue-400 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

const CheckCircle2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Overview;
