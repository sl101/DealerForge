'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
      } else {
        setLeaderboard(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0f2fe]">
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[#67e8f9]">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-2xl font-bold">Global Leaderboard</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading && <p className="text-center py-20">Loading leaderboard...</p>}
        
        {error && (
          <div className="text-center py-20 text-red-400">
            Error: {error}<br />
            Make sure the table "leaderboard" exists in Supabase.
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <p className="text-center py-20 text-white/60">
            No results yet. Be the first!
          </p>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div key={entry.id || index} className="glass p-6 rounded-3xl flex items-center gap-6">
                <div className="text-5xl font-bold w-16 text-[#67e8f9] text-center">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Player</div>
                  <div className="text-sm text-white/60">
                    {entry.tasks_solved || 0} tasks • {entry.accuracy || 0}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#67e8f9]">{entry.score || 0}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}