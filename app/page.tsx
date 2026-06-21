'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Timer, RefreshCw, Trophy } from 'lucide-react';
import { generateRouletteTask, RouletteTask } from '@/lib/roulette';

export default function TrainPage() {
  const [currentTask, setCurrentTask] = useState<RouletteTask | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const answerInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeUp = () => {
    if (currentTask) {
      setIsCorrect(false);
    }
  };

  const generateNewTask = () => {
    setIsLoading(true);
    setUserAnswer('');
    setIsCorrect(null);
    setTimeLeft(60);

    const task = generateRouletteTask();
    setCurrentTask(task);
    setIsLoading(false);

    setTimeout(() => {
      answerInputRef.current?.focus();
      answerInputRef.current?.select();
      startTimer();
    }, 300);
  };

  const handleSubmit = () => {
    if (!currentTask || !userAnswer) return;

    stopTimer(); // ← Останавливаем таймер

    setTotalAttempts(prev => prev + 1);
    const answerNum = parseInt(userAnswer);
    
    const isAnswerCorrect = answerNum === currentTask.correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      const points = Math.max(40, Math.floor(timeLeft * 6)); // Больше очков за скорость
      setScore(prev => prev + points);
    }
  };

  const nextTask = () => {
    stopTimer();
    setIsCorrect(null);
    setUserAnswer('');
    generateNewTask();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0f2fe]">
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[#67e8f9] hover:text-white">
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
            <Trophy className="mx-auto w-24 h-24 text-[#67e8f9] mb-8" />
            <h1 className="text-5xl font-bold mb-6">Roulette Payout Trainer</h1>
            <p className="text-xl text-white/70 mb-12">Calculate chips for covered winning numbers</p>
            <button 
              onClick={generateNewTask}
              disabled={isLoading}
              className="bg-[#67e8f9] hover:bg-[#22d3ee] text-black font-semibold text-2xl px-16 py-7 rounded-3xl transition-all active:scale-95"
            >
              {isLoading ? 'Generating...' : 'New Challenge'}
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex justify-center">
              <div className="glass px-12 py-5 rounded-3xl flex items-center gap-4 text-4xl font-mono tracking-widest shadow-xl">
                <Timer className="text-[#67e8f9]" /> {timeLeft}
              </div>
            </div>

            <div className="glass p-10 rounded-3xl">
              <p className="text-2xl leading-relaxed whitespace-pre-line mb-10 font-medium">
                {currentTask.description}
              </p>

              <div className="bg-zinc-950 border border-white/10 rounded-3xl h-80 mb-10 flex items-center justify-center text-white/40 overflow-hidden text-center p-8">
                Grok Imagine: Close-up with chips + Dolly on {currentTask.winningNumber}
              </div>

              <input
                ref={answerInputRef}
                type="number"
                inputMode="decimal"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleSubmit();
                  }
                }}
                placeholder="Total payout chips"
                className="w-full bg-zinc-900 border-2 border-[#67e8f9]/50 focus:border-[#67e8f9] rounded-3xl px-8 py-8 text-5xl text-center font-mono focus:outline-none shadow-inner"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="flex-1 bg-[#67e8f9] hover:bg-[#22d3ee] disabled:bg-zinc-700 text-black font-semibold py-7 rounded-3xl text-2xl transition-all"
              >
                Submit Answer
              </button>
              <button onClick={nextTask} className="flex-1 border border-white/30 hover:bg-white/5 py-7 rounded-3xl text-2xl">Skip</button>
            </div>

            {isCorrect !== null && (
              <div className={`p-10 rounded-3xl text-center border-2 ${isCorrect ? 'border-green-500 bg-green-950/30' : 'border-red-500 bg-red-950/30'}`}>
                <p className="text-5xl mb-4">{isCorrect ? '🎉 Perfect!' : '😔 Wrong'}</p>
                <p className="text-3xl">Correct: <span className="font-mono font-bold">{currentTask.correctAnswer}</span></p>
                {isCorrect && <p className="text-xl text-[#67e8f9] mt-2">Time left: {timeLeft}s (+{Math.floor(timeLeft * 6)} points)</p>}
                <button onClick={nextTask} className="mt-10 bg-white/10 hover:bg-white/20 px-14 py-5 rounded-2xl text-xl">Next Task →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}