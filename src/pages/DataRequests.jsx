import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquarePlus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  School,
  FileText
} from 'lucide-react';

const DataRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [college, setCollege] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/requests`, {
        quantity: Number(quantity),
        college,
        message
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setShowModal(false);
      setQuantity('');
      setCollege('');
      setMessage('');
      fetchRequests();
    } catch (err) {
      alert('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/requests/${id}`, { status }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchRequests();
    } catch (err) {
      alert('Failed to update request');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center">
            <MessageSquarePlus className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Data Fulfillment</h2>
            <p className="text-slate-500 text-xs font-medium">Request and manage lead distributions</p>
          </div>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary h-12 px-6 shadow-xl shadow-green-600/20">
            <Plus size={18} />
            <span>New Request</span>
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50 bg-slate-50/50">
              <tr>
                <th className="px-8 py-5">Requesting Agent</th>
                <th className="px-8 py-5">Requested Volume</th>
                <th className="px-8 py-5">Agent Remarks</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium italic">Synchronizing requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">No requests in queue.</td></tr>
              ) : requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                        {(req.employeeId?.name || 'Y').charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{req.employeeId?.name || 'Personal Request'}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-black border border-green-100">
                        {req.quantity}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Target Institution</div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          {req.college || 'General Pool'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-start gap-2 max-w-xs text-sm text-slate-500 font-medium italic line-clamp-1">
                      <FileText size={14} className="text-slate-300 mt-1 shrink-0" />
                      "{req.message || 'No remarks provided'}"
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        req.status === 'Fulfilled' ? 'bg-green-50 text-green-600 border-green-100' :
                          'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {isAdmin && req.status === 'Pending' ? (
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleUpdateStatus(req._id, 'Fulfilled')} className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm" title="Approve Request"><CheckCircle size={18} /></button>
                        <button onClick={() => handleUpdateStatus(req._id, 'Rejected')} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm" title="Reject Request"><XCircle size={18} /></button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.status === 'Pending' ? 'Awaiting Approval' : 'Completed'}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200 ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Request Lead Access</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">Specify the volume and target criteria for your assignment</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantity *</label>
                  <input
                    type="number"
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-900"
                    placeholder="e.g. 100"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Institution</label>
                  <input
                    type="text"
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium"
                    placeholder="e.g. MIT"
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Request Rationale *</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] font-medium text-slate-700"
                  placeholder="Explain why you need this additional data volume..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary h-14 font-bold shadow-xl shadow-green-600/20">
                  {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataRequests;
