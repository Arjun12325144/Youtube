"use client";

import { Suspense, useState, useRef } from "react";
import HistoryContent from "@/components/HistoryContent";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Loader2, History, Search, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function HistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useUser();

  const handleClearAll = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to clear all watch history?")) return;
    
    try {
      await axiosInstance.delete(`/history/clear/${user._id}`);
      setRefreshKey(prev => prev + 1); // Force refresh
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

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
                <div className="p-3 rounded-full bg-[var(--color-primary)]/10">
                  <History className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Watch History</h1>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Videos you've watched</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors">
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary)] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
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
              <HistoryContent key={refreshKey} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}