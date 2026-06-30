'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message = "Great work!" }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password);
      onClose();
    } catch (error: any) {
      alert(error.message || 'Error');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full screen backdrop */}
      <div className="fixed inset-0 bg-black/95 z-[99999]" />

      {/* Modal */}
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        <div className="glass w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-white/70 hover:text-white"
          >
            <X size={28} />
          </button>

          <h2 className="text-3xl font-bold text-center mb-2">Join DealerForge</h2>
          <p className="text-center text-white/70 mb-8 leading-relaxed">{message}</p>

          <div className="flex bg-zinc-900 rounded-2xl p-1 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-medium ${isLogin ? 'bg-[#67e8f9] text-black' : 'text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-medium ${!isLogin ? 'bg-[#67e8f9] text-black' : 'text-white'}`}
            >
              Register
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 bg-zinc-900 border border-white/30 rounded-2xl px-6 py-4 text-lg text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-8 bg-zinc-900 border border-white/30 rounded-2xl px-6 py-4 text-lg text-white"
          />

          <button 
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-[#67e8f9] text-black font-semibold py-4 rounded-3xl text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <button 
            onClick={onClose} 
            className="w-full mt-6 text-white/60 hover:text-white py-3"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </>
  );
}