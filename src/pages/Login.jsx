import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Loader2 } from 'lucide-react';
import API_BASE from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
      <div className="w-full max-w-md p-8 glass rounded-[2.5rem] shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 bg-white p-4 rounded-3xl inline-block shadow-xl shadow-white/5">
            <img src="/logo.png" alt="DigiCoders Logo" className="h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 font-medium mt-1">Sign in to your CRM dashboard</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="email@example.com"
                className="peer w-full pl-12 h-14 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-white placeholder:text-slate-600 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-green-500 transition-colors pointer-events-none" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                className="peer w-full pl-12 h-14 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-white placeholder:text-slate-600 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-green-500 transition-colors pointer-events-none" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 btn-primary text-sm font-black uppercase tracking-widest mt-4 shadow-xl shadow-green-600/20 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
