'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModeMenu from './components/ModeMenu';
import StudyTrainer from './components/StudyTrainer';
import PracticeTrainer from './components/PracticeTrainer';

type Mode = 'menu' | 'study' | 'practice';

export default function StandartCombosPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('menu');

  if (mode === 'study') return <StudyTrainer onBack={() => setMode('menu')} />;
  if (mode === 'practice') return <PracticeTrainer onBack={() => setMode('menu')} />;

  return (
    <ModeMenu
      onBack={() => router.push('/')}
      onStudy={() => setMode('study')}
      onPractice={() => setMode('practice')}
    />
  );
}