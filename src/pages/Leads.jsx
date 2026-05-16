import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import API_BASE from '../config';
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

const Leads = ({ user, cache, setCache, metadataCache, setMetadataCache }) => {
  const [leads, setLeads] = useState(cache?.leads || []);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(!cache?.leads);
  
  // Selection & Bulk Actions
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkEmployeeId, setBulkEmployeeId] = useState('');
  const [currentPage, setCurrentPage] = useState(cache?.currentPage || 1);
  const [leadsPerPage, setLeadsPerPage] = useState(cache?.leadsPerPage || (user?.role === 'admin' ? 100 : 10));

  const location = useLocation();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState(cache?.searchTerm || '');
  const [filters, setFilters] = useState(cache?.filters || {
    status: '',
    course: '',
    college: '',
    assigned: 'all',
    employeeId: ''
  });
  const [showFilters, setShowFilters] = useState(cache?.showFilters || false);

  const [totalLeads, setTotalLeads] = useState(cache?.totalLeads || 0);
  const [totalPages, setTotalPages] = useState(cache?.totalPages || 0);

  useEffect(() => {
    if (location.state?.filterType) {
      const { filterType, value } = location.state;
      setFilters(prev => ({
        ...prev,
        [filterType === 'all' ? 'status' : filterType]: value
      }));
      if (filterType !== 'all') setShowFilters(true);
      else {
        // Reset all filters if 'all' is clicked
        setFilters({ status: '', course: '', college: '', assigned: 'all', employeeId: '' });
        setSearchTerm('');
      }
    }
  }, [location.state]);

  // Add Lead Modal
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadData, setNewLeadData] = useState({ name: '', email: '', phone: '', course: '', college: '' });
  const [addingLead, setAddingLead] = useState(false);

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

  const statuses = [
    'New', 'Contacted', 'Interested', 'Not Interested', 'Busy', 
    'Callback', 'Wrong Number', 'Switch Off', 'Not Reachable', 
    'Follow Up', 'Meeting Scheduled', 'Qualified', 'Lost', 'Won', 'Archive'
  ];

  // Fetch leads with server-side pagination and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [currentPage, leadsPerPage, searchTerm, filters]);

  useEffect(() => {
    if (isAdmin) fetchEmployees();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: leadsPerPage === 'All' ? 1000 : leadsPerPage,
        search: searchTerm,
        status: filters.status,
        course: filters.course,
        college: filters.college,
        assigned: filters.assigned,
        employeeId: filters.employeeId
      };

      const res = await axios.get(`${API_BASE}/leads`, {
        params,
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      
      const leadsData = res.data.leads || (Array.isArray(res.data) ? res.data : []);
      const total = res.data.total || leadsData.length;
      const pages = res.data.totalPages || 1;

      setLeads(leadsData);
      setTotalLeads(total);
      setTotalPages(pages);

      setCache({
        leads: leadsData,
        totalLeads: total,
        totalPages: pages,
        currentPage,
        leadsPerPage,
        searchTerm,
        filters,
        showFilters
      });
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
    const targetLeads = isOldBackend ? displayLeads : leads;
    if (selectedLeads.length === targetLeads.length && targetLeads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(targetLeads.map(l => l._id));
    }
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

  const handleAddLead = async (e) => {
    e.preventDefault();
    setAddingLead(true);
    try {
      await axios.post(`${API_BASE}/leads`, newLeadData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setShowAddLead(false);
      setNewLeadData({ name: '', email: '', phone: '', course: '', college: '' });
      fetchLeads();
    } catch (err) {
      console.error('Add Lead Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Server connection failed';
      alert(`Could not add lead: ${errorMsg}`);
    } finally {
      setAddingLead(false);
    }
  };

  const [courses, setCourses] = useState(metadataCache?.courses || []);
  const [colleges, setColleges] = useState(metadataCache?.colleges || []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get(`${API_BASE}/leads/metadata`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const coursesData = res.data.courses || [];
        const collegesData = res.data.colleges || [];
        setCourses(coursesData);
        setColleges(collegesData);
        setMetadataCache({ courses: coursesData, colleges: collegesData });
      } catch (err) {
        console.warn("Metadata API not available, deriving from current leads", err);
        if (leads.length > 0) {
          setCourses([...new Set(leads.map(l => l.course).filter(Boolean))].sort());
          setColleges([...new Set(leads.map(l => l.college).filter(Boolean))].sort());
        }
      }
    };
    fetchMetadata();
  }, [leads.length === 0]); 

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filters, leadsPerPage]);

  const isOldBackend = !totalPages || totalPages <= 1;
  const displayLeads = (isOldBackend && leads.length > 0) ? leads.filter(l => {
    const matchesSearch = !searchTerm || l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone?.includes(searchTerm);
    const matchesStatus = !filters.status || l.status === filters.status;
    const matchesCourse = !filters.course || l.course === filters.course;
    const matchesCollege = !filters.college || l.college === filters.college;
    const matchesEmployee = !filters.employeeId || (l.assignedTo?._id === filters.employeeId || l.assignedTo === filters.employeeId);
    const matchesAssignment = filters.assigned === 'all' || (filters.assigned === 'assigned' && l.assignedTo) || (filters.assigned === 'unassigned' && !l.assignedTo);
    return matchesSearch && matchesStatus && matchesCourse && matchesCollege && matchesEmployee && matchesAssignment;
  }) : leads;

  const paginatedLeads = isOldBackend ? displayLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage) : leads;
  const finalTotalPages = isOldBackend ? Math.ceil(displayLeads.length / leadsPerPage) : totalPages;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex gap-3 w-full lg:flex-1">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search Lead..." 
              className="peer w-full !pl-14 pr-4 h-12 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-sm font-medium placeholder:text-slate-400 outline-none" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-green-600 transition-colors pointer-events-none" size={18} />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`w-14 h-12 border-2 rounded-2xl flex items-center justify-center transition-all ${
              showFilters 
              ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/30' 
              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 shadow-sm'
            }`}
          >
            <Filter size={20} strokeWidth={2.5} />
          </button>
          
          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-100 px-4 rounded-2xl shadow-sm h-12">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show:</span>
            <select 
              className="h-full bg-transparent border-none font-bold text-slate-900 text-xs outline-none focus:ring-0"
              value={leadsPerPage}
              onChange={(e) => setLeadsPerPage(e.target.value)}
            >
              {[10, 25, 50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
              <option value="All">All</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button onClick={() => setShowAddLead(true)} className="btn-primary h-12 px-6 flex-1 lg:flex-none">
            <UserPlus size={18} strokeWidth={2.5} /> 
            Add Lead
          </button>
          {isAdmin && (
            <button onClick={() => setShowImport(true)} className="px-5 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex-1 lg:flex-none">
              <FileUp size={18} strokeWidth={2.5} /> 
              Import
            </button>
          )}
        </div>
      </div>

      {/* Filter Options Drawer */}
      {showFilters && (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
            <select className="w-full h-11" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Course</label>
            <select className="w-full h-11" value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">College</label>
            <select className="w-full h-11" value={filters.college} onChange={e => setFilters({...filters, college: e.target.value})}>
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assigned Agent</label>
              <select className="w-full h-11" value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})}>
                <option value="">All Agents</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>
          )}
          <div className="lg:col-span-4 flex justify-end">
            <button 
              onClick={() => {
                setFilters({ status: '', course: '', college: '', assigned: 'all', employeeId: '' });
                setSearchTerm('');
              }}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {isAdmin && selectedLeads.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-blue-400 font-bold">{selectedLeads.length} Selected</span>
            <select className="h-9 text-xs bg-white border-blue-200 rounded-lg px-2" value={bulkEmployeeId} onChange={(e) => setBulkEmployeeId(e.target.value)}>
              <option value="">Assign to...</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
            <button onClick={handleBulkAssign} disabled={!bulkEmployeeId} className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 shadow-md shadow-blue-500/20">Apply</button>
            <button onClick={handleBulkDelete} className="h-9 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"><Trash2 size={14} className="inline mr-1" /> Delete</button>
          </div>
          <button onClick={() => setSelectedLeads([])} className="text-slate-400 text-xs hover:text-slate-600 font-medium">Clear Selection</button>
        </div>
      )}

      {/* Leads List */}
      <div className="card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 w-16 text-center">Sr No.</th>
                {isAdmin && <th className="px-6 py-4 w-10"><input type="checkbox" checked={selectedLeads.length > 0 && selectedLeads.length === leads.length} onChange={toggleSelectAll} /></th>}
                <th className="px-6 py-4">Lead Info</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">College</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (<tr><td colSpan="6" className="text-center py-12">Loading...</td></tr>) : paginatedLeads.map((lead, index) => (
                <tr key={lead._id}>
                  <td className="px-6 py-4 text-center font-bold text-slate-400">{(currentPage - 1) * (leadsPerPage === 'All' ? totalLeads : leadsPerPage) + index + 1}</td>
                  {isAdmin && <td className="px-6 py-4"><input type="checkbox" checked={selectedLeads.includes(lead._id)} onChange={() => toggleSelectOne(lead._id)} /></td>}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 leading-tight">{lead.name}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-600">{lead.course || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{lead.college || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      lead.status === 'Won' ? 'bg-green-50 text-green-600 border-green-100' :
                      lead.status === 'Lost' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <a 
                        href={`tel:${lead.phone}`} 
                        onClick={() => {
                          // Optional: Local state update if desired
                          if (lead.status === 'New') {
                            // Automatically update to contacted or check for follow-up logic
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Call"
                      >
                        <Phone size={14} fill="currentColor" />
                      </a>
                      <a 
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="WhatsApp"
                      >
                        <MessageSquare size={14} strokeWidth={2.5} />
                      </a>
                      <button 
                        onClick={() => { setCurrentLead(lead); setShowStatusModal(true); }} 
                        className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Update Status"
                      >
                        <Clock size={14} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(lead._id)} 
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Lead"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Modern Cards View */}
        <div className="lg:hidden p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-green-600" size={32} />
              <p className="font-medium">Curating your leads...</p>
            </div>
          ) : paginatedLeads.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium italic">No leads found in your queue.</p>
            </div>
          ) : (
            paginatedLeads.map((lead, index) => (
              <div 
                key={lead._id} 
                className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-premium relative group transition-all"
              >
                {/* Header Row: Info */}
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-400 border border-white shadow-inner">
                      {(lead.name || 'L').charAt(0)}
                    </div>
                    <div className="min-w-0 pt-1">
                      <h3 className="text-lg font-black text-slate-900 truncate uppercase leading-tight">{lead.name}</h3>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                        <Phone size={10} />
                        {lead.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Row: Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <div className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                    lead.status === 'Won' ? 'bg-green-50 border-green-100 text-green-600' :
                    lead.status === 'Lost' ? 'bg-red-50 border-red-100 text-red-600' :
                    'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                    {lead.status}
                  </div>
                  {lead.course && (
                    <div className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {lead.course}
                    </div>
                  )}
                  {lead.college && (
                    <div className="px-3 py-1 bg-green-50 rounded-xl border border-green-100/50 text-[10px] font-black text-green-600 uppercase tracking-widest">
                      {lead.college}
                    </div>
                  )}
                </div>

                {/* Unified Action Bar: 4 Icons */}
                <div className="flex items-center gap-3 pt-5 border-t border-slate-50">
                  <a 
                    href={`tel:${lead.phone}`} 
                    className="flex-1 h-12 flex items-center justify-center bg-green-600 text-white rounded-2xl shadow-lg shadow-green-600/20 active:scale-90 transition-all"
                    title="Call"
                  >
                    <Phone size={20} fill="currentColor" />
                  </a>
                  <a 
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 h-12 flex items-center justify-center bg-white border border-slate-200 text-green-600 rounded-2xl hover:bg-green-50 active:scale-90 transition-all"
                    title="WhatsApp"
                  >
                    <MessageSquare size={20} strokeWidth={2.5} />
                  </a>
                  <button 
                    onClick={() => { setCurrentLead(lead); setShowStatusModal(true); }}
                    className="flex-1 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 active:scale-90 transition-all"
                    title="Update Status"
                  >
                    <Clock size={20} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => handleDelete(lead._id)}
                    className="flex-1 h-12 flex items-center justify-center bg-white border border-slate-200 text-red-500 rounded-2xl hover:bg-red-50 active:scale-90 transition-all"
                    title="Delete Lead"
                  >
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {finalTotalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-50 bg-slate-50/30">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm">Previous</button>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Page <span className="text-slate-900">{currentPage}</span> of {finalTotalPages}</span>
            <button disabled={currentPage === finalTotalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm">Next</button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-slate-200">
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-50 shrink-0">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate pr-4">Update Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="shrink-0 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-6">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Lead Name</p>
                <p className="text-lg font-black text-slate-900">{currentLead?.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">New Status</label>
                <select className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-green-500 transition-all" value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Remark / Note</label>
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-green-500 min-h-[140px] text-slate-900 font-medium"
                  placeholder="Enter details of your conversation..."
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowStatusModal(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 btn-primary h-14 text-sm font-bold shadow-xl shadow-green-600/20">
                  {updating ? <Loader2 className="animate-spin mx-auto" /> : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight text-center">Import Leads</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleImport(); }} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-green-500 hover:bg-green-50/30 transition-all relative group">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files[0])} accept=".csv, .xlsx, .xls" />
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileUp className="text-slate-400 group-hover:text-green-600 transition-colors" size={32} />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">{selectedFile ? selectedFile.name : 'Choose a file'}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">CSV, XLSX or XLS</p>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowImport(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={importing} className="flex-1 btn-primary h-14 font-bold shadow-xl shadow-green-600/20">{importing ? 'Processing...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-slate-200">
            <div className="flex justify-between items-center p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Lead</h3>
              <button onClick={() => setShowAddLead(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleAddLead} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name *</label>
                <input 
                  type="text" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={newLeadData.name} 
                  onChange={e => setNewLeadData({...newLeadData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Phone Number *</label>
                  <input 
                    type="text" 
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                    value={newLeadData.phone} 
                    onChange={e => setNewLeadData({...newLeadData, phone: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                  <input 
                    type="email" 
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                    value={newLeadData.email} 
                    onChange={e => setNewLeadData({...newLeadData, email: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Course / Interest *</label>
                <select 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none" 
                  value={newLeadData.course} 
                  onChange={e => setNewLeadData({...newLeadData, course: e.target.value})} 
                  required
                >
                  <option value="">Select Course</option>
                  {[
                    'B.Tech (CS/IT)', 'B.Tech (Mechanical)', 'B.Tech (Civil)', 'B.Tech (Electrical)',
                    'M.Tech', 'BCA', 'MCA', 'Diploma (CS/IT)', 'B.Sc (IT)', 'M.Sc (IT)',
                    'Python Full Stack', 'Java Full Stack', 'Web Development (MERN)',
                    'Data Science', 'AI & ML', 'Digital Marketing', 'Cyber Security',
                    'Other Technical'
                  ].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">College / University</label>
                <input 
                  type="text" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={newLeadData.college} 
                  onChange={e => setNewLeadData({...newLeadData, college: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddLead(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={addingLead} className="flex-1 btn-primary h-14 font-bold shadow-xl shadow-green-600/20">
                  {addingLead ? 'Adding...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
