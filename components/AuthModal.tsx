'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message = "Save your progress and compete on the global leaderboard!" }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (error: any) {
      alert(error.message || 'Something went wrong');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="glass max-w-md w-full rounded-3xl p-8 relative">
        <h2 className="text-3xl font-bold text-center mb-3">Join DealerForge</h2>
        <p className="text-center text-white/70 mb-8 leading-relaxed">{message}</p>

        <div className="flex gap-2 mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-2xl font-medium ${isLogin ? 'bg-[#67e8f9] text-black' : 'bg-white/10'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-2xl font-medium ${!isLogin ? 'bg-[#67e8f9] text-black' : 'bg-white/10'}`}
          >
            Register
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4 text-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-8 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4 text-lg"
        />

        <button 
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full bg-[#67e8f9] hover:bg-[#22d3ee] disabled:opacity-70 text-black font-semibold py-4 rounded-3xl text-lg mb-4 transition-all"
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <button 
          onClick={onClose}
          className="w-full text-white/60 py-3 hover:text-white/80 transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}