'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Timer, RefreshCw, Trophy } from 'lucide-react';

interface Task {
  id: string;
  description: string;
  correctAnswer: number;
  difficulty: string;
  imagePrompt?: string;
}

export default function TrainPage() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const generateTask = async () => {
    setIsLoading(true);
    setUserAnswer('');
    setIsCorrect(null);

    // В реальном приложении здесь будет вызов Grok API для генерации
    const sampleTasks: Task[] = [
      {
        id: 't1',
        description: '7 Straights on 17 ($25 each) + 13 Splits on 8-9 ($15 each) + 7 Corners on 25-26-28-29 ($10 each) + 6 Streets on 13-14-15 ($20 each). Calculate total payout in chips.',
        correctAnswer: 945,
        difficulty: 'Hard',
        imagePrompt: 'realistic roulette table with many yellow casino chips stacked on multiple bet positions including straights splits corners, professional lighting, top down view'
      },
      {
        id: 't2',
        description: 'Straight $50 on 23 + Split $30 on 16-17 + Corner $25 on 4-5-7-8 + Line bet $40 on 19-20-21-22-23-24. Total payout?',
        correctAnswer: 785,
        difficulty: 'Hard',
        imagePrompt: 'casino roulette layout with colorful chip stacks on straight split corner and line bets, detailed chips, dramatic lighting'
      }
    ];

    const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
    setCurrentTask(randomTask);
    setTimeLeft(60);
    setIsLoading(false);
  };

  useEffect(() => {
    if (timeLeft > 0 && currentTask) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentTask) {
      handleSubmit();
    }
  }, [timeLeft, currentTask]);

  const handleSubmit = () => {
    if (!currentTask || !userAnswer) return;
    
    setTotalAttempts(prev => prev + 1);
    const answerNum = parseInt(userAnswer);
    
    if (answerNum === currentTask.correctAnswer) {
      setIsCorrect(true);
      const points = Math.max(20, timeLeft * 3);
      setScore(prev => prev + points);
    } else {
      setIsCorrect(false);
    }
  };

  const nextTask = () => {
    setIsCorrect(null);
    setUserAnswer('');
    generateTask();
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0f2fe]">
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-[#67e8f9] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} /> Dashboard
          </button>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div>Score: <span className="text-[#67e8f9]">{score}</span></div>
            <div>Attempts: {totalAttempts}</div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!currentTask ? (
          <div className="text-center py-24">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-[#67e8f9]/20 to-transparent rounded-full flex items-center justify-center mb-10">
              <Trophy className="w-20 h-20 text-[#67e8f9]" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Roulette Payout Trainer</h1>
            <p className="text-xl text-white/70 max-w-lg mx-auto mb-12">
              AI generates realistic complex bet combinations. Train your brain like a real pit boss.
            </p>
            <button 
              onClick={generateTask}
              disabled={isLoading}
              className="bg-[#67e8f9] hover:bg-[#22d3ee] disabled:bg-gray-600 text-black font-semibold text-2xl px-16 py-7 rounded-3xl transition-all active:scale-[0.97] flex items-center gap-4 mx-auto shadow-xl shadow-cyan-500/30"
            >
              {isLoading ? '🤖 Generating AI Challenge...' : 'Start New AI Challenge'}
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex justify-center">
              <div className="glass px-10 py-4 rounded-3xl flex items-center gap-4 text-3xl font-mono tracking-widest">
                <Timer className="text-[#67e8f9]" /> {timeLeft}
              </div>
            </div>

            <div className="glass p-10 rounded-3xl">
              <div className="flex justify-between mb-6">
                <span className="px-5 py-2 bg-white/10 rounded-full text-sm uppercase tracking-widest">{currentTask.difficulty}</span>
                <button onClick={generateTask} className="text-[#67e8f9] hover:text-white">
                  <RefreshCw size={24} />
                </button>
              </div>

              <p className="text-2xl leading-relaxed mb-10">{currentTask.description}</p>

              {/* Место для изображения от Grok Imagine */}
              <div className="bg-black/60 border border-white/10 rounded-2xl h-80 mb-10 flex items-center justify-center text-white/30 overflow-hidden">
                🎨 Grok Imagine would generate realistic chip layout here
              </div>

              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter total payout"
                className="w-full bg-[#0f172a] border border-white/20 focus:border-[#67e8f9] rounded-2xl px-8 py-6 text-4xl text-center font-mono focus:outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="flex-1 bg-[#67e8f9] hover:bg-[#22d3ee] disabled:opacity-50 text-black font-semibold py-6 rounded-3xl text-xl transition-all"
              >
                Submit Answer
              </button>
              <button 
                onClick={nextTask}
                className="flex-1 border border-white/30 hover:bg-white/5 py-6 rounded-3xl text-xl transition-all"
              >
                Skip → 
              </button>
            </div>

            {isCorrect !== null && (
              <div className={`p-8 rounded-3xl text-center border-2 ${isCorrect ? 'border-green-500 bg-green-950/50' : 'border-red-500 bg-red-950/50'}`}>
                <p className="text-4xl mb-3">{isCorrect ? '🎉 Perfect!' : '😔 Not quite'}</p>
                <p className="text-xl">Correct payout: <span className="font-mono font-bold text-3xl">{currentTask.correctAnswer}</span></p>
                <button 
                  onClick={nextTask}
                  className="mt-8 bg-white/10 hover:bg-white/20 px-12 py-4 rounded-2xl text-lg"
                >
                  Next Challenge →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}