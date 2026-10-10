'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPro: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshPro: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const loadPro = async (uid: string | undefined) => {
    if (!uid) {
      setIsPro(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', uid)
      .maybeSingle();
    setIsPro(Boolean(data?.is_pro));
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      void loadPro(data.session?.user?.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      setLoading(false);
      void loadPro(next?.user?.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const name = displayName.trim();
    if (!name) throw new Error('Enter a nickname');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: SITE_URL ? `${SITE_URL}/auth` : undefined,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsPro(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: SITE_URL
        ? `${SITE_URL}/auth/reset`
        : `${window.location.origin}/auth/reset`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const refreshPro = async () => {
    await loadPro(user?.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isPro,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
