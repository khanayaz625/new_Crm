import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Shield, Trash2 } from 'lucide-react';
import API_BASE from '../config';

const Team = () => {
  const [employees, setEmployees] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', password: '', role: 'employee' });
  
  const [showEdit, setShowEdit] = useState(false);
  const [editEmp, setEditEmp] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/auth/register`, newEmp);
      setShowAdd(false);
      fetchEmployees();
      setNewEmp({ name: '', email: '', password: '', role: 'employee' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    try {
      const updateData = { name: editEmp.name, email: editEmp.email };
      if (editEmp.password) updateData.password = editEmp.password;

      await axios.put(`${API_BASE}/users/${editEmp._id}`, updateData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setShowEdit(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDelete = async (id) => {
    console.log('Attempting to delete user with ID:', id);
    console.log('Using API_BASE:', API_BASE);

    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const url = `${API_BASE}/users/${id}`;
      console.log('Full Delete URL:', url);

      await axios.delete(url, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      console.log('Delete command sent successfully');
      fetchEmployees();
    } catch (err) {
      console.error('Frontend Delete Error:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Management</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Manage your agents and access controls</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary h-12 shadow-xl shadow-green-600/20">
          <UserPlus size={18} />
          <span>Add New Member</span>
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Add Team Member</h3>
            <form onSubmit={handleAddEmployee} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
                <input 
                  type="password" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={newEmp.password}
                  onChange={(e) => setNewEmp({...newEmp, password: e.target.value})}
                  required 
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-primary h-14 font-bold shadow-xl shadow-green-600/20">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && editEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Edit Member Profile</h3>
            <form onSubmit={handleEditEmployee} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={editEmp.name}
                  onChange={(e) => setEditEmp({...editEmp, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  value={editEmp.email}
                  onChange={(e) => setEditEmp({...editEmp, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Password <span className="text-[8px] opacity-50">(Optional)</span></label>
                <input 
                  type="password" 
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium" 
                  placeholder="Leave blank to keep current"
                  onChange={(e) => setEditEmp({...editEmp, password: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-primary h-14 font-bold shadow-xl shadow-green-600/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {employees.map((emp) => (
          <div key={emp._id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-green-200 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-green-50 transition-colors"></div>
            
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-slate-400 border-2 border-white shadow-inner mb-4">
              {(emp.name || 'E').charAt(0)}
            </div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight relative z-10">{emp.name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-2 relative z-10">
              <Mail size={14} className="text-slate-300" />
              <span>{emp.email}</span>
            </div>
            <div className="mt-6 flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border border-slate-100 relative z-10">
              <Shield size={12} className="text-slate-300" />
              {emp.role}
            </div>
            <div className="mt-10 pt-8 border-t border-slate-50 w-full flex justify-between relative z-10">
              <button onClick={() => { setEditEmp(emp); setShowEdit(true); }} className="text-slate-900 font-black text-[10px] uppercase tracking-widest hover:text-green-600 transition-colors">Edit Profile</button>
              <button 
                onClick={() => handleDelete(emp._id)}
                className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
