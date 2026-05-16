 // Calls.jsx - Clean implementation
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, User, Clock, MessageSquare, Bell } from 'lucide-react';
import API_BASE from '../config';

const Calls = ({ user }) => {
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(50);

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
      
      setLogs(res.data.logs);
      setTotalLogs(res.data.total);
      setTotalPages(res.data.totalPages);
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

  // No more client-side filtering
  const filteredLogs = logs;

  // Reset to page 1 when filters or search change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterDate, filterEmployeeId, filterStartDateTime, filterEndDateTime, logsPerPage]);

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
        {/* Table */}
        <div className="overflow-x-auto">
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
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No interaction logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">
                        {log.leadId?.name || 'Deleted Lead'}
                      </div>
                      <div className="text-[10px] text-slate-500">{log.leadId?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-500" />
                        {typeof log.employeeId === 'object' ? log.employeeId?.name : 'N/A'}
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
                        <p className="text-sm text-slate-300 italic">
                          {log.remark || 'No remark'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setReminderLog(log);
                          setReminderDateTime('');
                          setShowReminder(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="Set Reminder"
                      >
                        <Bell size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              Page <span className="font-bold text-white">{currentPage}</span> of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages} 
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
