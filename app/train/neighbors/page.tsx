'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModeMenu from './components/ModeMenu';
import CardsTrainer from './components/CardsTrainer';
import TimedTrainer from './components/TimedTrainer';

type Mode = 'menu' | 'cards' | 'timed';

export default function NeighborsPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('menu');

  if (mode === 'menu') {
    return (
      <ModeMenu
        onBack={() => router.push('/')}
        onStartCards={() => setMode('cards')}
        onStartTimed={() => setMode('timed')}
      />
    );
  }

  if (mode === 'cards') {
    return <CardsTrainer onBack={() => setMode('menu')} />;
  }

  if (mode === 'timed') {
    return <TimedTrainer onBack={() => setMode('menu')} />;
  }

  return null;
}