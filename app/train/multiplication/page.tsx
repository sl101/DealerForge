'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModeMenu from './components/ModeMenu';
import TablesView from './components/TablesView';
import CardsTrainer from './components/CardsTrainer';
import PracticeTrainer from './components/PracticeTrainer';

type Mode = 'menu' | 'tables' | 'cards' | 'practice';

export default function MultiplicationPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('menu');

  if (mode === 'tables') return <TablesView onBack={() => setMode('menu')} />;
  if (mode === 'cards') return <CardsTrainer onBack={() => setMode('menu')} />;
  if (mode === 'practice') return <PracticeTrainer onBack={() => setMode('menu')} />;

  return (
    <ModeMenu
      onBack={() => router.push('/')}
      onTables={() => setMode('tables')}
      onCards={() => setMode('cards')}
      onPractice={() => setMode('practice')}
    />
  );
}