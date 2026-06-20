'use client';

import { useState } from 'react';
import { Trophy, Play, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button'; // создадим позже

export default function Home() {
  const [stats] = useState({
    accuracy: 94,
    tasksToday: 245,
    streak: 7,
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#67e8f9] to-[#a5b4fc] rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎰</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DealerForge</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#67e8f9]">Level 12 • Pro Dealer</div>
            <div className="w-9 h-9 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-[#67e8f9]">{stats.accuracy}%</div>
            <div className="text-sm text-white/60 mt-1">Accuracy</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold">{stats.tasksToday}</div>
            <div className="text-sm text-white/60 mt-1">Tasks Today</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-[#a5b4fc]">{stats.streak}</div>
            <div className="text-sm text-white/60 mt-1">Day Streak 🔥</div>
          </div>
        </div>

        {/* Main Action */}
        <div className="card p-10 text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#67e8f9]/20 to-transparent rounded-full flex items-center justify-center mb-8">
            <Play className="w-16 h-16 text-[#67e8f9]" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Ready to Train?</h2>
          <p className="text-xl text-white/70 mb-8 max-w-md mx-auto">
            Master complex roulette payouts with AI-generated challenges
          </p>
          <button 
            onClick={() => window.location.href = '/train'}
            className="bg-[#67e8f9] hover:bg-[#22d3ee] text-black font-semibold text-xl px-12 py-4 rounded-2xl transition-all active:scale-95 flex items-center gap-3 mx-auto"
          >
            Start Roulette Math Training
          </button>
        </div>

        {/* Leaderboard Teaser */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="text-yellow-400" /> Global Leaderboard
            </h3>
            <button className="text-[#67e8f9] text-sm">View All →</button>
          </div>
          {/* Placeholder for top players */}
        </div>
      </div>
    </div>
  );
}