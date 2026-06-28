'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

let globalShowModal: (() => void) | null = null;

export function showAuthModal() {
  globalShowModal?.();
}

export default function GlobalAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    globalShowModal = () => setIsOpen(true);
    return () => { globalShowModal = null; };
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password);
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message || 'Error');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl p-8 relative">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
          <X size={28} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">Join DealerForge</h2>
        <p className="text-center text-white/70 mb-8">Great work! Save your progress and compete on the leaderboard.</p>

        <div className="flex bg-zinc-900 rounded-2xl p-1 mb-8">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl ${isLogin ? 'bg-[#67e8f9] text-black font-semibold' : ''}`}>Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl ${!isLogin ? 'bg-[#67e8f9] text-black font-semibold' : ''}`}>Register</button>
        </div>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 bg-zinc-900 border border-white/30 rounded-2xl px-6 py-4" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-8 bg-zinc-900 border border-white/30 rounded-2xl px-6 py-4" />

        <button onClick={handleSubmit} disabled={loading || !email || !password} className="w-full bg-[#67e8f9] text-black font-semibold py-4 rounded-3xl text-lg">
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <button onClick={() => setIsOpen(false)} className="w-full mt-6 text-white/60 hover:text-white">
          Continue as Guest
        </button>
      </div>
    </div>
  );
}