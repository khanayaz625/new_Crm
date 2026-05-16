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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Team Management</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <UserPlus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Add Team Member</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  className="w-full" 
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  className="w-full" 
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Password</label>
                <input 
                  type="password" 
                  className="w-full" 
                  value={newEmp.password}
                  onChange={(e) => setNewEmp({...newEmp, password: e.target.value})}
                  required 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-800 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && editEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Edit Team Member</h3>
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  className="w-full" 
                  value={editEmp.name}
                  onChange={(e) => setEditEmp({...editEmp, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  className="w-full" 
                  value={editEmp.email}
                  onChange={(e) => setEditEmp({...editEmp, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Password <span className="text-xs text-slate-500">(leave blank to keep current)</span></label>
                <input 
                  type="password" 
                  className="w-full" 
                  onChange={(e) => setEditEmp({...editEmp, password: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2 border border-slate-800 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div key={emp._id} className="card flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-4">
              {emp.name.charAt(0)}
            </div>
            <h3 className="font-bold text-lg">{emp.name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
              <Mail size={14} />
              <span>{emp.email}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-700">
              <Shield size={12} />
              {emp.role}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 w-full flex justify-around">
              <button onClick={() => { setEditEmp(emp); setShowEdit(true); }} className="text-slate-500 hover:text-white transition-all text-sm font-medium">Edit Profile</button>
              <button 
                onClick={() => handleDelete(emp._id)}
                className="text-red-500/70 hover:text-red-500 transition-all"
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
