 // Calls.jsx - Clean implementation
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, User, Clock, MessageSquare, Bell } from 'lucide-react';
import API_BASE from '../config';

const Calls = ({ user, cache, setCache }) => {
  const [logs, setLogs] = useState(cache?.logs || []);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(!cache?.logs);
  const [filterDate, setFilterDate] = useState(cache?.filterDate || '');
  const [filterStartDateTime, setFilterStartDateTime] = useState(cache?.filterStartDateTime || '');
  const [filterEndDateTime, setFilterEndDateTime] = useState(cache?.filterEndDateTime || '');
  const [filterStatus, setFilterStatus] = useState(cache?.filterStatus || '');
  const [searchTerm, setSearchTerm] = useState(cache?.searchTerm || '');
  const [filterEmployeeId, setFilterEmployeeId] = useState(cache?.filterEmployeeId || '');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderLog, setReminderLog] = useState(null);
  const [reminderDateTime, setReminderDateTime] = useState('');

  const isAdmin = user?.role === 'admin';

  const [totalLogs, setTotalLogs] = useState(cache?.totalLogs || 0);
  const [totalPages, setTotalPages] = useState(cache?.totalPages || 0);
  const [currentPage, setCurrentPage] = useState(cache?.currentPage || 1);
  const [logsPerPage, setLogsPerPage] = useState(cache?.logsPerPage || 50);

  // Fetch logs and employees on mount
  useEffect(() => {
    if (isAdmin) fetchEmployees();
  }, []);

  // Fetch logs with server-side pagination and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [currentPage, logsPerPage, searchTerm, filterStatus, filterDate, filterEmployeeId, filterStartDateTime, filterEndDateTime]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: logsPerPage,
        search: searchTerm,
        status: filterStatus,
        startDate: filterStartDateTime || filterDate, // Use filterDate as fallback if specific range not set
        endDate: filterEndDateTime,
        employeeId: filterEmployeeId
      };

      const res = await axios.get(`${API_BASE}/leads/logs`, {
        params,
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      
      const logsData = res.data.logs || (Array.isArray(res.data) ? res.data : []);
      const total = res.data.total || logsData.length;
      const pages = res.data.totalPages || 1;

      setLogs(logsData);
      setTotalLogs(total);
      setTotalPages(pages);

      setCache({
        logs: logsData,
        totalLogs: total,
        totalPages: pages,
        currentPage,
        logsPerPage,
        searchTerm,
        filterStatus,
        filterDate,
        filterEmployeeId,
        filterStartDateTime,
        filterEndDateTime
      });
    } catch (err) {
      console.error('Failed to fetch call logs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/employees`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  // Hybrid Filtering: If the backend is old (returns all logs in an array), 
  // we must filter on the client. If it's the new backend, we use the data as-is.
  const isOldBackend = !totalPages || totalPages <= 1;
  const filteredLogs = (isOldBackend && logs.length > 0) ? logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.leadId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.leadId?.phone?.includes(searchTerm);
    const matchesStatus = !filterStatus || log.status === filterStatus;
    const matchesEmployee = !filterEmployeeId || (log.employeeId?._id === filterEmployeeId || log.employeeId === filterEmployeeId);
    
    // Date filter
    const logDate = new Date(log.createdAt).toISOString().split('T')[0];
    const matchesDate = !filterDate || logDate === filterDate;
    
    return matchesSearch && matchesStatus && matchesEmployee && matchesDate;
  }) : logs;

  const displayLogs = isOldBackend ? filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage) : logs;
  const finalTotalPages = isOldBackend ? Math.ceil(filteredLogs.length / logsPerPage) : totalPages;

  // Reset to page 1 when filters or search change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterDate, filterEmployeeId, logsPerPage]);

  const handleSetReminder = () => {
    if (reminderLog && reminderDateTime) {
      console.log('Reminder set for', reminderLog._id, reminderDateTime);
      // TODO: integrate backend endpoint
      setShowReminder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center">
                <Phone className="text-green-600" size={24} />
              </div>
              Call & Interaction Logs
            </h3>
            <p className="text-slate-500 text-xs font-medium mt-1 ml-15">Track all communications with your leads</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Lead..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <select
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {[
                'New', 'Contacted', 'Interested', 'Not Interested', 'Busy', 
                'Callback', 'Wrong Number', 'Switch Off', 'Not Reachable', 
                'Follow Up', 'Meeting Scheduled', 'Qualified', 'Lost', 'Won', 'Archive'
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {isAdmin && (
              <select
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
              >
                <option value="">All Agents</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-5">Lead Details</th>
                <th className="px-6 py-5">Assigned Agent</th>
                <th className="px-6 py-5">Interaction Status</th>
                <th className="px-6 py-5">Agent Remarks</th>
                <th className="px-6 py-5 text-center">Actions</th>
                <th className="px-6 py-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-medium italic">Refreshing logs...</td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-medium">No interaction logs found.</td></tr>
              ) : (
                displayLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{log.leadId?.name || 'Deleted Lead'}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{log.leadId?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {(typeof log.employeeId === 'object' ? log.employeeId?.name : 'S').charAt(0)}
                        </div>
                        <div className="text-sm font-medium text-slate-700">
                          {typeof log.employeeId === 'object' ? log.employeeId?.name : 'System Agent'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs text-sm text-slate-500 font-medium line-clamp-2">
                        <MessageSquare size={14} className="text-slate-300 mt-1 shrink-0" />
                        {log.remark || 'No remark added'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => { setReminderLog(log); setReminderDateTime(''); setShowReminder(true); }} 
                          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm"
                        >
                          <Bell size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-300 font-medium">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
         <div className="lg:hidden space-y-6 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-green-600" size={32} />
              <p className="font-medium">Refreshing logs...</p>
            </div>
          ) : displayLogs.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No interaction logs found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayLogs.map((log) => (
                <div 
                  key={log._id} 
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/50 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">{log.leadId?.name || 'Deleted Lead'}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{log.leadId?.phone}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-2xl bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                      {log.status}
                    </span>
                  </div>
 
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50 mb-6 relative">
                    <div className="flex items-start gap-3">
                      <MessageSquare size={16} className="text-slate-300 shrink-0 mt-1" />
                      <p className="text-sm text-slate-600 font-medium italic leading-relaxed">"{log.remark || 'No remark added'}"</p>
                    </div>
                  </div>
 
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {(typeof log.employeeId === 'object' ? log.employeeId?.name : 'S').charAt(0)}
                        </div>
                        {typeof log.employeeId === 'object' ? log.employeeId?.name : 'System Agent'}
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-medium ml-1">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReminderLog(log);
                        setReminderDateTime('');
                        setShowReminder(true);
                      }}
                      className="w-14 h-14 bg-white border border-slate-200 text-slate-400 flex items-center justify-center rounded-2xl shadow-sm hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all active:scale-95"
                    >
                      <Bell size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-50 bg-slate-50/30 mt-4">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              Previous
            </button>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Page <span className="text-slate-900">{currentPage}</span> of {finalTotalPages}
            </span>
            <button 
              disabled={currentPage === finalTotalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Reminder Modal */}
      {showReminder && reminderLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Set Follow-up Reminder</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Setting reminder for: <span className="text-slate-900 font-bold">{reminderLog.leadId?.name || 'Unknown Lead'}</span>
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Reminder Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={reminderDateTime}
                  onChange={(e) => setReminderDateTime(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowReminder(false)}
                  className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetReminder}
                  disabled={!reminderDateTime}
                  className="flex-1 btn-primary h-14 font-bold shadow-xl shadow-green-600/20 disabled:opacity-50 disabled:shadow-none"
                >
                  Save Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calls;
