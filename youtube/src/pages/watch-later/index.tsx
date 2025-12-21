"use client";

import { Suspense, useState } from 'react';
import WatchLaterContent from '@/components/WatchLaterContent';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Loader2, Clock, Play, Shuffle } from "lucide-react";

export default function WatchLaterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-[72px]"}`}>
          <div className="p-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Watch Later</h1>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Videos saved for later</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-red-700 transition-colors">
                  <Play className="w-4 h-4" />
                  Play all
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors">
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
            </div>
            
            <Suspense 
              fallback={
                <div className="flex items-center justify-center h-[40vh]">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
              }
            >
              <WatchLaterContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}