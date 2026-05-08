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
  const API_BASE = 'http://localhost:5001/api';

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
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <MessageSquarePlus className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold">Data Requests</h2>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} />
            <span>New Request</span>
          </button>
        )}
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Request Details</th>
                <th className="px-6 py-4">Message / Remark</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">No requests found.</td></tr>
              ) : requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-800/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-100">{req.employeeId?.name || 'You'}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{new Date(req.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{req.quantity}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-tighter">Leads for</span>
                    </div>
                    <div className="text-sm font-medium text-slate-200 flex items-center gap-1">
                      <School size={12} className="text-slate-500" />
                      {req.college || 'Any College'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-xs">
                      <FileText size={14} className="text-slate-500 mt-1 shrink-0" />
                      <p className="text-sm text-slate-400 italic">"{req.message || 'No remarks provided'}"</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        req.status === 'Fulfilled' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && req.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(req._id, 'Fulfilled')} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg shadow-sm" title="Approve Request"><CheckCircle size={18} /></button>
                        <button onClick={() => handleUpdateStatus(req._id, 'Rejected')} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg shadow-sm" title="Reject Request"><XCircle size={18} /></button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">{req.status === 'Pending' ? 'Awaiting Admin' : 'Processed'}</div>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-blue-400" size={24} />
              Request New Data
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quantity</label>
                  <input
                    type="number"
                    className="w-full h-12"
                    placeholder="e.g. 100"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Interest of College</label>
                  <input
                    type="text"
                    className="w-full h-12"
                    placeholder="e.g. MIT"
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Remarks / Notes</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Tell admin why you need this data..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-800 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary h-12">
                  {submitting ? <Loader2 className="animate-spin" /> : 'Send Request'}
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
