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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Phone className="text-blue-400" size={24} /> Call & Interaction Logs
          </h3>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Lead..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm flex-1 sm:w-48 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="date"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <select
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {[
                'New', 'Contacted', 'Interested', 'Not Interested', 'Busy', 
                'Callback', 'Wrong Number', 'Switch Off', 'Not Reachable', 
                'Follow Up', 'Meeting Scheduled', 'Qualified', 'Lost', 'Won', 'Archive'
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {/* Datetime range filters */}
            <input
              type="datetime-local"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              value={filterStartDateTime}
              onChange={(e) => setFilterStartDateTime(e.target.value)}
              placeholder="Start DateTime"
            />
            <input
              type="datetime-local"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              value={filterEndDateTime}
              onChange={(e) => setFilterEndDateTime(e.target.value)}
              placeholder="End DateTime"
            />
            {isAdmin && (
              <select
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Remark</th>
                <th className="px-6 py-4">Reminder</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">Loading logs...</td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No interaction logs found.</td></tr>
              ) : (
                displayLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{log.leadId?.name || 'Deleted Lead'}</div>
                      <div className="text-[10px] text-slate-500">{log.leadId?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-500" />
                        {typeof log.employeeId === 'object' ? log.employeeId?.name : 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-600/20">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs text-sm text-slate-300 italic">
                        <MessageSquare size={14} className="text-slate-500 mt-1 shrink-0" />
                        {log.remark || 'No remark'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => { setReminderLog(log); setReminderDateTime(''); setShowReminder(true); }} className="text-blue-400 hover:text-blue-300">
                        <Bell size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {loading ? (
            <div className="text-center py-20 text-slate-500">Loading logs...</div>
          ) : displayLogs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-500">No interaction logs found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayLogs.map((log) => (
                <div 
                  key={log._id} 
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">{log.leadId?.name || 'Deleted Lead'}</h3>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest">{log.leadId?.phone}</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                      {log.status}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/50 mb-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare size={16} className="text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 italic">"{log.remark || 'No remark added'}"</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <User size={12} />
                        {typeof log.employeeId === 'object' ? log.employeeId?.name : 'System'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReminderLog(log);
                        setReminderDateTime('');
                        setShowReminder(true);
                      }}
                      className="w-12 h-12 bg-blue-600/10 text-blue-400 flex items-center justify-center rounded-2xl border border-blue-600/20"
                    >
                      <Bell size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-800 mt-4">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border border-slate-700 rounded-lg text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page <span className="font-bold text-white">{currentPage}</span> of {finalTotalPages}
            </span>
            <button 
              disabled={currentPage === finalTotalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border border-slate-700 rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Reminder Modal */}
      {showReminder && reminderLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Set Reminder</h3>
            <p className="mb-2 text-slate-300">
              Lead: <span className="text-white font-medium">{reminderLog.leadId?.name || 'Unknown'}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm outline-none"
                value={reminderDateTime}
                onChange={(e) => setReminderDateTime(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReminder(false)}
                className="flex-1 px-4 py-2 border border-slate-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSetReminder}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded font-medium transition-colors"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calls;
