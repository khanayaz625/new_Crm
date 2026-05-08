import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, CheckCircle2, User, Clock, MessageSquare } from 'lucide-react';

const Calls = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/leads/logs', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Phone className="text-blue-400" size={24} />
          Call & Interaction Logs
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Remark</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">No interaction logs found.</td></tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-100">{log.leadId?.name || 'Deleted Lead'}</div>
                    <div className="text-[10px] text-slate-500">{log.leadId?.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-500" />
                      {log.employeeId?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-600/20">
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-xs">
                      <MessageSquare size={14} className="text-slate-500 mt-1 shrink-0" />
                      <p className="text-sm text-slate-300 italic">"{log.remark || 'No remark'}"</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calls;
