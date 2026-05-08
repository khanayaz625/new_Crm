import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import API_BASE from '../config';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' // Defaulting to admin as per user request
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/auth/register`, formData);
      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-6 group hover:scale-110 transition-all duration-500">
            <UserPlus className="text-blue-500 group-hover:rotate-12 transition-transform" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-slate-400">Join DigiCoders CRM as an administrator.</p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/5">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  name="name"
                  className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  name="email"
                  className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="admin@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  name="password"
                  className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 group shadow-lg shadow-blue-600/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
