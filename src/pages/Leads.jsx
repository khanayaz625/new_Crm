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
        [filterType]: value
      }));
      if (filterType !== 'all') setShowFilters(true);
    }
  }, [location]);

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
    if (selectedLeads.length === leads.length) setSelectedLeads([]);
    else setSelectedLeads(leads.map(l => l._id));
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
      alert(err.response?.data?.message || 'Failed to add lead');
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
          <button onClick={() => setShowAddLead(true)} className="btn-primary h-11"><UserPlus size={18} /> Add Lead</button>
          {isAdmin && <button onClick={() => setShowImport(true)} className="px-4 h-11 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><FileUp size={18} /> Import</button>}
        </div>
      </div>

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
                {isAdmin && <th className="px-6 py-4 w-10"><input type="checkbox" checked={selectedLeads.length > 0 && selectedLeads.length === leads.length} onChange={toggleSelectAll} /></th>}
                <th className="px-6 py-4">Lead Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (<tr><td colSpan="5" className="text-center py-12">Loading...</td></tr>) : paginatedLeads.map(lead => (
                <tr key={lead._id}>
                  {isAdmin && <td className="px-6 py-4"><input type="checkbox" checked={selectedLeads.includes(lead._id)} onChange={() => toggleSelectOne(lead._id)} /></td>}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{lead.status}</span></td>
                  <td className="px-6 py-4">{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setCurrentLead(lead); setShowStatusModal(true); }} className="text-blue-600 font-bold text-sm">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Modern Cards View */}
        <div className="lg:hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
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
            paginatedLeads.map((lead) => (
              <div 
                key={lead._id} 
                className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden group transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 mb-6 border-4 border-white shadow-xl">
                      {lead.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">{lead.name}</h3>
                    <p className="text-sm font-bold text-green-600 mt-1 uppercase tracking-widest">{lead.college || 'Gizmo Experts'}</p>
                  </div>

                  <div className="flex justify-center gap-5 mb-10">
                    <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-14 h-14 bg-white border-2 border-green-600/20 text-green-600 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all active:scale-90"><MessageSquare size={24} strokeWidth={2.5} /></a>
                    <button className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all active:scale-90 border border-green-600/20"><div className="w-4 h-4 bg-white rounded-full"></div></button>
                    <a href={`tel:${lead.phone}`} className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all active:scale-90"><Phone size={24} fill="currentColor" /></a>
                    <button className="w-14 h-14 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90 shadow-md"><Mail size={24} /></button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2.5 mb-10">
                    <span className="px-5 py-2.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">Retail</span>
                    <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${lead.status === 'Follow Up' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{lead.status === 'Follow Up' ? 'To Follow-up' : lead.status}</span>
                    <span className="px-5 py-2.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest border border-purple-100 shadow-sm">VIP</span>
                  </div>

                  <div className="bg-slate-50/50 rounded-[2.5rem] p-7 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interaction Snippet</span>
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{lead.assignedTo?.name?.charAt(0) || 'A'}</div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium italic">"Call scheduled with {lead.name} today at 16:00"</p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Clock size={12} className="text-slate-300" />Today at 16:00 • Gizmo Experts</div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center px-2">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (<div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden"><div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">P</div></div>))}
                    </div>
                    {/* Use Plus icon here */}
                    <div className="w-14 h-14 bg-green-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-green-600/20 active:scale-95 transition-all"><span className="text-2xl font-bold">+</span></div>
                  </div>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Course / Interest</label>
                <input 
                  type="text" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={newLeadData.course} 
                  onChange={e => setNewLeadData({...newLeadData, course: e.target.value})} 
                />
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
