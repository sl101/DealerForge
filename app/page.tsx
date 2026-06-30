'use client';

import { useRouter } from 'next/navigation';
import { Trophy, Play, Award, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const goToTraining = () => router.push('/train');
  const goToLeaderboard = () => router.push('/leaderboard');

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen pb-20 bg-[#1a1a2e]">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#67e8f9] to-[#a5b4fc] rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎰</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">DealerForge</h1>
          </div>
          
          {user && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2 text-white">
            Welcome back, {user ? 'Dealer' : 'Guest'}!
          </h2>
          <p className="text-white/70 text-lg">Train your skills. Beat the table.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="glass p-6 text-center rounded-3xl">
            <div className="text-4xl font-bold text-[#67e8f9]">94%</div>
            <div className="text-sm text-white/70 mt-1">Accuracy</div>
          </div>
          <div className="glass p-6 text-center rounded-3xl">
            <div className="text-4xl font-bold text-white">245</div>
            <div className="text-sm text-white/70 mt-1">Tasks Today</div>
          </div>
          <div className="glass p-6 text-center rounded-3xl">
            <div className="text-4xl font-bold text-[#a5b4fc]">7 🔥</div>
            <div className="text-sm text-white/70 mt-1">Day Streak</div>
          </div>
        </div>

        {/* Training Button */}
        <button 
          onClick={goToTraining}
          className="w-full glass p-10 text-center rounded-3xl hover:bg-white/5 transition-all mb-6 group"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#67e8f9]/30 to-transparent rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Play className="w-12 h-12 text-[#67e8f9]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Start Training</h3>
          <p className="text-white/70">Roulette Payout Challenges</p>
        </button>

        {/* Leaderboard Button */}
        <button 
          onClick={goToLeaderboard}
          className="w-full glass p-10 text-center rounded-3xl hover:bg-white/5 transition-all group"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#a5b4fc]/30 to-transparent rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Trophy className="w-12 h-12 text-[#a5b4fc]" />
          </div>
          <h3 className="text-2xl font-bold text--foreground mb-2">Global Leaderboard</h3>
          <p className="text-white/70">See top dealers worldwide</p>
        </button>
      </div>
    </div>
  );
}