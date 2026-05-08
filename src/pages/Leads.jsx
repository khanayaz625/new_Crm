import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { 
  FileUp, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  X
} from 'lucide-react';

const Leads = ({ user }) => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Bulk Actions
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkEmployeeId, setBulkEmployeeId] = useState('');

  const location = useLocation();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    college: '',
    assigned: 'all',
    employeeId: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (location.state?.filterType) {
      const { filterType, value } = location.state;
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));
      if (filterType !== 'all') setShowFilters(true);
    }
  }, [location]);

  // Modals
  const [showImport, setShowImport] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  
  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.role === 'admin';
  const API_BASE = 'http://localhost:5001/api';

  const statuses = [
    'New', 'Contacted', 'Interested', 'Not Interested', 'Busy', 
    'Callback', 'Wrong Number', 'Switch Off', 'Not Reachable', 
    'Follow Up', 'Meeting Scheduled', 'Qualified', 'Lost', 'Won', 'Archive'
  ];

  useEffect(() => {
    fetchLeads();
    if (isAdmin) fetchEmployees();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leads`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/employees`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`${API_BASE}/leads/${currentLead._id}/status`, {
        status: newStatus,
        remark: remark
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setShowStatusModal(false);
      fetchLeads();
      setNewStatus('');
      setRemark('');
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // ... other handlers (Bulk, Delete, etc.)
  const handleBulkAssign = async () => {
    if (!bulkEmployeeId || selectedLeads.length === 0) return;
    try {
      await axios.put(`${API_BASE}/leads/bulk-assign`, {
        leadIds: selectedLeads,
        employeeId: bulkEmployeeId
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setSelectedLeads([]);
      setBulkEmployeeId('');
      fetchLeads();
    } catch (err) { alert('Bulk assignment failed'); }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0 || !window.confirm('Delete selected?')) return;
    try {
      await axios.delete(`${API_BASE}/leads/bulk-delete`, {
        data: { leadIds: selectedLeads },
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setSelectedLeads([]);
      fetchLeads();
    } catch (err) { alert('Bulk delete failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`${API_BASE}/leads/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchLeads();
    } catch (err) { alert('Delete failed'); }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) setSelectedLeads([]);
    else setSelectedLeads(filteredLeads.map(l => l._id));
  };

  const toggleSelectOne = (id) => {
    if (selectedLeads.includes(id)) setSelectedLeads(selectedLeads.filter(sid => sid !== id));
    else setSelectedLeads([...selectedLeads, id]);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await axios.post(`${API_BASE}/leads/import`, formData, {
        headers: { 
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowImport(false);
      fetchLeads();
    } catch (err) { alert(err.response?.data?.message || 'Import failed'); }
    finally { setImporting(false); }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || (l.phone && l.phone.includes(searchTerm));
    const matchesStatus = !filters.status || l.status === filters.status;
    const matchesCourse = !filters.course || l.course === filters.course;
    const matchesCollege = !filters.college || l.college === filters.college;
    const matchesEmployee = !filters.employeeId || (l.assignedTo && (l.assignedTo._id === filters.employeeId || l.assignedTo === filters.employeeId));
    const matchesAssignment = filters.assigned === 'all' || (filters.assigned === 'assigned' && l.assignedTo) || (filters.assigned === 'unassigned' && !l.assignedTo);
    return matchesSearch && matchesStatus && matchesCourse && matchesCollege && matchesEmployee && matchesAssignment;
  });

  const courses = [...new Set(leads.map(l => l.course).filter(Boolean))];
  const colleges = [...new Set(leads.map(l => l.college).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Search..." className="w-full pl-10 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`px-4 h-11 border rounded-xl flex items-center gap-2 ${showFilters ? 'bg-blue-600/10 border-blue-600 text-blue-400' : 'border-slate-800 text-slate-400'}`}>
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
        <div className="flex gap-3">
          {isAdmin && <button onClick={() => setShowImport(true)} className="btn-primary h-11"><FileUp size={18} /> Import</button>}
        </div>
      </div>

      {isAdmin && selectedLeads.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-blue-400 font-bold">{selectedLeads.length} Selected</span>
            <select className="h-9 text-xs" value={bulkEmployeeId} onChange={(e) => setBulkEmployeeId(e.target.value)}>
              <option value="">Assign to...</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
            <button onClick={handleBulkAssign} disabled={!bulkEmployeeId} className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold">Apply</button>
            <button onClick={handleBulkDelete} className="h-9 px-4 bg-red-600/10 text-red-400 border border-red-600/20 rounded-lg text-xs font-bold"><Trash2 size={14} className="inline mr-1" /> Delete</button>
          </div>
          <button onClick={() => setSelectedLeads([])} className="text-slate-500 text-xs">Clear</button>
        </div>
      )}

      {showFilters && (
        <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in slide-in-from-top-2">
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}><option value="">All Statuses</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})}><option value="">All Courses</option>{courses.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select value={filters.college} onChange={e => setFilters({...filters, college: e.target.value})}><option value="">All Colleges</option>{colleges.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select value={filters.assigned} onChange={e => setFilters({...filters, assigned: e.target.value})}><option value="all">All Assignment</option><option value="assigned">Assigned</option><option value="unassigned">Unassigned</option></select>
          {isAdmin && (
            <select value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})}>
              <option value="">All Employees</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-10"><input type="checkbox" checked={selectedLeads.length > 0 && selectedLeads.length === filteredLeads.length} onChange={toggleSelectAll} /></th>
                <th className="px-6 py-4">Lead Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (<tr><td colSpan="5" className="text-center py-12">Loading...</td></tr>) : filteredLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedLeads.includes(lead._id)} onChange={() => toggleSelectOne(lead._id)} /></td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.phone} | {lead.course}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setCurrentLead(lead); setNewStatus(lead.status); setShowStatusModal(true); }}
                      className="flex items-center gap-2 hover:bg-slate-800 px-3 py-1 rounded-lg transition-all"
                    >
                      <span className="text-xs font-bold text-blue-400">{lead.status}</span>
                      <ChevronDown size={14} className="text-slate-500" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">{lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"><MessageCircle size={18} /></a>
                      <a href={`tel:${lead.phone}`} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"><Phone size={18} /></a>
                      {isAdmin && <button onClick={() => handleDelete(lead._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={18} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold">Update Lead: {currentLead?.name}</h3>
              <button onClick={() => setShowStatusModal(false)}><X size={24} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">New Status</label>
                <select className="w-full h-12" value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Remark / Note</label>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Enter details of your conversation..."
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowStatusModal(false)} className="flex-1 px-4 py-3 border border-slate-800 rounded-xl">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 btn-primary h-12">
                  {updating ? <Loader2 className="animate-spin" /> : 'Save Update & Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Import Leads</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleImport(); }} className="space-y-6">
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files[0])} accept=".csv, .xlsx, .xls" />
                <FileUp className="mx-auto text-slate-500 mb-2" size={32} />
                <p className="text-sm text-slate-400">{selectedFile ? selectedFile.name : 'Select file'}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowImport(false)} className="flex-1 px-4 py-2 border border-slate-800 rounded-lg">Cancel</button>
                <button type="submit" disabled={importing} className="flex-1 btn-primary">{importing ? 'Importing...' : 'Start'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
