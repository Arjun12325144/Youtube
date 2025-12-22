"use client";

import { Suspense, useState, useEffect } from 'react';
import WatchLaterContent from '@/components/WatchLaterContent';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Loader2, Clock, Play, Shuffle } from "lucide-react";

export default function WatchLaterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mainClass = isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass}`}>
          <div className="p-3 sm:p-4 lg:p-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-full bg-purple-500/10">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">Watch Later</h1>
                  <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">Videos saved for later</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-red-700 transition-colors text-sm">
                  <Play className="w-4 h-4" />
                  <span>Play all</span>
                </button>
                <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors text-sm">
                  <Shuffle className="w-4 h-4" />
                  <span className="hidden sm:inline">Shuffle</span>
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