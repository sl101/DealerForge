'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert(isLogin ? 'Logged in!' : 'Check your email for confirmation');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="glass p-10 rounded-3xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">DealerForge</h1>
        
        <div className="flex gap-4 mb-8">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-2xl ${isLogin ? 'bg-[#67e8f9] text-black' : 'bg-white/10'}`}>Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-2xl ${!isLogin ? 'bg-[#67e8f9] text-black' : 'bg-white/10'}`}>Register</button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-8 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4"
        />

        <button 
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-[#67e8f9] text-black font-semibold py-4 rounded-3xl text-lg"
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}