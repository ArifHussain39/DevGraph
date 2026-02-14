'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

const SplitPanel = dynamic(() => import('@/components/SplitPanel'), { ssr: false });

export default function HomePage() {
  return (
    <main className='app-container'>
      <Navbar />
      <div className='main-content'>
        <SplitPanel />
      </div>
    </main>
  );
}
