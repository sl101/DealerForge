'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Enter email and password');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          alert(error.message);
          return;
        }
        router.push('/');
        return;
      }

      // Register
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      // With "Confirm email" disabled, session is usually present immediately
      if (data.session) {
        router.push('/');
        return;
      }

      // Edge case: user created but no session (or email already registered)
      if (data.user) {
        alert('Account created. You can sign in now.');
        setIsLogin(true);
        return;
      }

      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="glass p-10 rounded-3xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          DealerForge
        </h1>

        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-2xl ${
              isLogin ? 'bg-[#67e8f9] text-black' : 'bg-white/10 text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-2xl ${
              !isLogin ? 'bg-[#67e8f9] text-black' : 'bg-white/10 text-white'
            }`}
          >
            Register
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-8 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4 text-white"
        />

        <button
          type="button"
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-[#67e8f9] text-black font-semibold py-4 rounded-3xl text-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}